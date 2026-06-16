// modules/leads/leadActivity.model.js
const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
      index: true,
    },

    action: {
      type: String,
      required: true,
    },

    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("LeadActivity", activitySchema);
