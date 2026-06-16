// routes/index.js
const express = require("express");

const router = express.Router();

const authRoutes = require("../modules/auth/auth.routes");
const leadRoutes = require("../modules/leads/lead.routes");
const analyticsRoutes = require("../modules/analytics/analytics.routes");
const reportRoutes = require("../modules/reports/report.routes");
const userRoutes = require("../modules/users/user.routes");
const notificationRoutes = require("../modules/notifications/notification.routes");
const integrationRoutes = require("../modules/integrations/integration.routes");

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/leads", leadRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/reports", reportRoutes);
router.use("/notifications", notificationRoutes);
router.use("/integrations", integrationRoutes);

module.exports = router;
