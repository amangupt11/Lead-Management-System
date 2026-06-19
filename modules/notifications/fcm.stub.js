// modules/notifications/fcm.stub.js
// Real Firebase Cloud Messaging (HTTP v1) sender, with a console-log stub
// fallback for environments where GOOGLE_APPLICATION_CREDENTIALS isn't set
// (e.g. local dev without a service-account JSON on disk).
//
// Initialization is lazy and idempotent — safe to call from any module.
const admin = require("firebase-admin");
const env = require("../../config/env");
let initialized = false;
let initAttempted = false;
const init = () => {
  if (initAttempted) return;
  initAttempted = true;
  if (!env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.warn(
      "[FCM] GOOGLE_APPLICATION_CREDENTIALS not set — push notifications " +
        "disabled (stub-log mode).",
    );
    return;
  }
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
    initialized = true;
    console.log("[FCM] Firebase Admin SDK initialized.");
  } catch (err) {
    console.error("[FCM] Failed to initialize:", err.message);
  }
};
init();
/**
 * Send a push notification.
 *
 * send({ tokens, title, body, data })
 *
 * tokens : string | string[] - one or more device FCM tokens
 * title : string - notification title
 * body : string - notification body
 * data : object - extra payload (all values coerced to string)
 *
 * Returns { ok, sent, failed, stub? }.
 * - In stub-log mode it just console.logs and returns { ok: true, stub:
true }.
 * - With no tokens it skips the call and returns { ok: true, sent: 0,
skipped: true }.
 */
const send = async ({ tokens, title, body, data = {} } = {}) => {
  // Stub-log mode (no credentials configured)
  if (!initialized) {
    console.log(
      `[FCM-STUB] -> ${
        tokens
          ? `tokens=${Array.isArray(tokens) ? tokens.length : 1}`
          : "broadcast"
      } | ${title} :: ${body} | data=$
{JSON.stringify(data)}`,
    );
    return { ok: true, stub: true };
  }
  const tokenList = Array.isArray(tokens)
    ? tokens.filter(Boolean)
    : [tokens].filter(Boolean);
  if (tokenList.length === 0) {
    return { ok: true, sent: 0, skipped: true };
  }
  // FCM requires data values to be strings
  const stringData = {};
  for (const [k, v] of Object.entries(data)) {
    if (v != null) stringData[k] = String(v);
  }
  try {
    const response = await admin.messaging().sendEachForMulticast({
      tokens: tokenList,
      notification: { title, body },
      data: stringData,
      android: {
        priority: "high",
        notification: {
          channelId: "lms_default",
          sound: "default",
        },
      },
      apns: {
        payload: { aps: { sound: "default" } },
      },
    });
    if (response.failureCount > 0) {
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.warn(
            `[FCM] Token ${tokenList[idx].slice(0, 8)}… failed: $
{resp.error?.message}`,
          );
        }
      });
    }
    return {
      ok: true,
      sent: response.successCount,
      failed: response.failureCount,
    };
  } catch (err) {
    console.error("[FCM] send failed:", err.message);
    return { ok: false, error: err.message };
  }
};
module.exports = { send };
