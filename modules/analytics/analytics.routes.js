// modules/analytics/analytics.routes.js
const express = require("express");

const router = express.Router();

const protect = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/role.middleware");

const {
  getDashboardStats,
  getBySource,
  getByCampaign,
  getFunnel,
  getTimeSeries,
  getUserPerformance,
} = require("./analytics.controller");

router.use(protect);

router.get("/dashboard", getDashboardStats);
router.get("/by-source", getBySource);
router.get("/by-campaign", getByCampaign);
router.get("/funnel", getFunnel);
router.get("/timeseries", getTimeSeries);
router.get(
  "/users-performance",
  authorize("admin", "manager"),
  getUserPerformance,
);

module.exports = router;
