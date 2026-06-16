// modules/notifications/notification.model.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },

    message: { type: String, required: true },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    type: {
      type: String,
      enum: [
        "new_lead",
        "assignment",
        "follow_up_reminder",
        "daily_summary",
        "system",
      ],
      default: "system",
    },

    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    audience: {
      type: String,
      enum: ["user", "role", "all"],
      default: "user",
    },

    role: {
      type: String,
      enum: ["admin", "manager", "sales", null],
      default: null,
    },
  },
  { timestamps: true },
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
