// modules/notifications/notification.service.js
const Notification = require("./notification.model");
const User = require("../users/user.model");
const fcm = require("./fcm.stub");
/**
 * Resolve the FCM device tokens that should receive this notification,
 * based on the notification's audience field.
 *
 * audience: "user" -> the single user.fcmToken
 * audience: "role" -> every active user with that role
 * audience: "all" -> every active user with a token
 */
const resolveRecipientTokens = async (notif) => {
  const filter = { isActive: true, fcmToken: { $nin: [null, ""] } };
  if (notif.audience === "user") {
    if (!notif.userId) return [];
    filter._id = notif.userId;
  } else if (notif.audience === "role") {
    if (!notif.role) return [];
    filter.role = notif.role;
  }
  // audience === "all" -> no extra filter
  const users = await User.find(filter).select("fcmToken").lean();
  return users.map((u) => u.fcmToken).filter(Boolean);
};
const create = async (payload) => {
  const notif = await Notification.create(payload);
  // Best-effort push — if FCM init failed or there are no tokens yet, the
  // notification row is still saved and visible in the mobile app's Inbox.
  try {
    const tokens = await resolveRecipientTokens(notif);
    await fcm.send({
      tokens,
      title: notif.title,
      body: notif.message,
      data: {
        type: notif.type,
        leadId: notif.leadId ? String(notif.leadId) : "",
        notificationId: String(notif._id),
      },
    });
  } catch (err) {
    console.error("[notifications] push delivery failed:", err.message);
  }
  return notif;
};
const notifyNewLead = async (lead) => {
  return create({
    title: "New lead received",
    message: `${lead.name} (${lead.source}) — ${lead.phone}`,
    type: "new_lead",
    leadId: lead._id,
    audience: "role",
    role: "manager",
  });
};
const notifyAssignment = async (lead, userId) => {
  return create({
    title: "Lead assigned to you",
    message: `${lead.name} (${lead.source}) — please follow up`,
    userId,
    type: "assignment",
    leadId: lead._id,
    audience: "user",
  });
};
const notifyFollowUp = async (lead) => {
  const userId = lead.assignedTo || null;
  return create({
    title: "Follow-up reminder",
    message: `Lead "${lead.name}" hasn't been contacted in 24h`,
    userId,
    type: "follow_up_reminder",
    leadId: lead._id,
    audience: userId ? "user" : "role",
    role: userId ? null : "manager",
  });
};
const sendDailySummary = async (summary) => {
  const admins = await User.find({ role: { $in: ["admin", "manager"] } });
  const message =
    `New: ${summary.new} | Contacted: ${summary.contacted} | ` +
    `Converted: ${summary.converted} | Rejected: ${summary.rejected} | ` +
    `Total today: ${summary.totalToday}`;
  const created = [];
  for (const u of admins) {
    created.push(
      await create({
        title: "Daily lead summary",
        message,
        userId: u._id,
        type: "daily_summary",
        audience: "user",
      }),
    );
  }
  return created;
};
const listForUser = async (user, queryParams = {}) => {
  const { page = 1, limit = 20, unread } = queryParams;
  const query = {
    $or: [
      { audience: "all" },
      { audience: "user", userId: user._id },
      { audience: "role", role: user.role },
    ],
  };
  if (unread === "true") query.isRead = false;
  const skip = (page - 1) * limit;
  const items = await Notification.find(query)
    .sort("-createdAt")
    .skip(skip)
    .limit(Number(limit));
  const total = await Notification.countDocuments(query);
  return { total, page: Number(page), limit: Number(limit), items };
};
const markRead = async (user, id) => {
  const notif = await Notification.findOneAndUpdate(
    {
      _id: id,
      $or: [
        { audience: "all" },
        { audience: "user", userId: user._id },
        { audience: "role", role: user.role },
      ],
    },
    { isRead: true },
    { new: true },
  );
  return notif;
};
const markAllRead = async (user) => {
  const result = await Notification.updateMany(
    {
      isRead: false,
      $or: [
        { audience: "all" },
        { audience: "user", userId: user._id },
        { audience: "role", role: user.role },
      ],
    },
    { isRead: true },
  );
  return { modified: result.modifiedCount };
};
module.exports = {
  create,
  notifyNewLead,
  notifyAssignment,
  notifyFollowUp,
  sendDailySummary,
  listForUser,
  markRead,
  markAllRead,
};
