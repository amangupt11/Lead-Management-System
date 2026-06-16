// config/env.js - Load environment variables and export configuration
require("dotenv").config();

// Helper to convert string to boolean
const bool = (v, def = false) => {
  if (v === undefined) return def;
  return String(v).toLowerCase() === "true";
};

module.exports = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 5000,
  API_VERSION: process.env.API_VERSION || "v1",
  BASE_URL: process.env.BASE_URL || "http://localhost:5000",

  MONGODB_URI: process.env.MONGODB_URI,

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || "1d",

  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "30d",

  BCRYPT_SALT_ROUNDS: Number(process.env.BCRYPT_SALT_ROUNDS || 10),

  ADMIN_NAME: process.env.ADMIN_NAME,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,

  INTEGRATION_MODE: (process.env.INTEGRATION_MODE || "dummy").toLowerCase(),

  CRON: {
    LEAD_SIMULATOR: bool(process.env.CRON_LEAD_SIMULATOR, true),
    FOLLOWUP_REMINDER: bool(process.env.CRON_FOLLOWUP_REMINDER, true),
    DAILY_SUMMARY: bool(process.env.CRON_DAILY_SUMMARY, true),
  },

  WEBHOOK_SECRETS: {
    meta: process.env.WEBHOOK_META_SECRET,
    google: process.env.WEBHOOK_GOOGLE_SECRET,
    website: process.env.WEBHOOK_WEBSITE_SECRET,
  },

  FCM_SERVER_KEY: process.env.FCM_SERVER_KEY,
};
