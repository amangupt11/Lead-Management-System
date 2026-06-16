// modules/jobs/cron.js
const cron = require("node-cron");

const env = require("../../config/env");
const Lead = require("../leads/lead.model");
const integrationService = require("../integrations/integration.service");
const notificationService = require("../notifications/notification.service");

const leadSimulatorJob = () => {
  cron.schedule("*/2 * * * *", async () => {
    try {
      const result = await integrationService.simulate();
      console.log(
        `[cron:lead-simulator] ${result.provider} -> ${result.lead._id} created=${result.created}`,
      );
    } catch (err) {
      console.error("[cron:lead-simulator] error:", err.message);
    }
  });
  console.log("[cron] lead simulator scheduled (every 2 min)");
};

const followUpReminderJob = () => {
  cron.schedule("0 * * * *", async () => {
    try {
      const threshold = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const stale = await Lead.find({
        status: { $in: ["new", "contacted"] },
        createdAt: { $lte: threshold },
      });

      let sent = 0;
      for (const lead of stale) {
        await notificationService.notifyFollowUp(lead);
        sent++;
      }

      console.log(`[cron:follow-up] ${sent} reminders sent`);
    } catch (err) {
      console.error("[cron:follow-up] error:", err.message);
    }
  });
  console.log("[cron] follow-up reminder scheduled (hourly)");
};

const dailySummaryJob = () => {
  cron.schedule("0 9 * * *", async () => {
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const [newC, contacted, converted, rejected, totalToday] =
        await Promise.all([
          Lead.countDocuments({ status: "new" }),
          Lead.countDocuments({ status: "contacted" }),
          Lead.countDocuments({ status: "converted" }),
          Lead.countDocuments({ status: "rejected" }),
          Lead.countDocuments({ createdAt: { $gte: startOfDay } }),
        ]);

      await notificationService.sendDailySummary({
        new: newC,
        contacted,
        converted,
        rejected,
        totalToday,
      });

      console.log("[cron:daily-summary] dispatched");
    } catch (err) {
      console.error("[cron:daily-summary] error:", err.message);
    }
  });
  console.log("[cron] daily summary scheduled (09:00)");
};

const start = () => {
  if (env.CRON.LEAD_SIMULATOR) leadSimulatorJob();
  if (env.CRON.FOLLOWUP_REMINDER) followUpReminderJob();
  if (env.CRON.DAILY_SUMMARY) dailySummaryJob();
};

module.exports = { start };
