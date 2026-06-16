// modules/analytics/analytics.controller.js
const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");

const analyticsService = require("./analytics.service");

exports.getDashboardStats = asyncHandler(async (req, res) => {
  const data = await analyticsService.getDashboardStats(req.query);
  res
    .status(200)
    .json(new ApiResponse(200, "Dashboard statistics fetched", data));
});

exports.getBySource = asyncHandler(async (req, res) => {
  const data = await analyticsService.getBySource(req.query);
  res.status(200).json(new ApiResponse(200, "Leads by source", data));
});

exports.getByCampaign = asyncHandler(async (req, res) => {
  const data = await analyticsService.getByCampaign(req.query);
  res.status(200).json(new ApiResponse(200, "Leads by campaign", data));
});

exports.getFunnel = asyncHandler(async (req, res) => {
  const data = await analyticsService.getFunnel(req.query);
  res.status(200).json(new ApiResponse(200, "Conversion funnel", data));
});

exports.getTimeSeries = asyncHandler(async (req, res) => {
  const data = await analyticsService.getTimeSeries(req.query);
  res.status(200).json(new ApiResponse(200, "Time series", data));
});

exports.getUserPerformance = asyncHandler(async (req, res) => {
  const data = await analyticsService.getUserPerformance(req.query);
  res.status(200).json(new ApiResponse(200, "User performance", data));
});
