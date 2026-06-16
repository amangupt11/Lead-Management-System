// modules/notifications/fcm.stub.js
const env = require("../../config/env");

const send = async ({ token, title, body, data = {} }) => {
  if (!env.FCM_SERVER_KEY) {
    console.log(
      `[FCM-STUB] -> token=${token || "broadcast"} | ${title} :: ${body} | data=${JSON.stringify(
        data,
      )}`,
    );
    return { ok: true, stub: true };
  }

  return { ok: true, stub: false };
};

module.exports = { send };
