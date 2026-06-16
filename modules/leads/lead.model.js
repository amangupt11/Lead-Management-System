// modules/leads/lead.model.js
const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
    },

    source: {
      type: String,
      enum: ["website", "facebook", "instagram", "google_ads"],
      required: true,
    },

    campaign: {
      type: String,
      default: null,
    },

    keyword: {
      type: String,
      default: null,
    },

    inquiry: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["new", "contacted", "follow_up", "converted", "rejected"],
      default: "new",
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    remarks: [
      {
        message: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Lead", leadSchema);
