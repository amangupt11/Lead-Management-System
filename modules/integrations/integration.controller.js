// modules/integrations/integration.controller.js
const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");
const ApiError = require("../../utils/ApiError");
const env = require("../../config/env");

const integrationService = require("./integration.service");
const factory = require("./provider.factory");

exports.syncAll = asyncHandler(async (req, res) => {
  const results = await integrationService.syncAll();
  res
    .status(200)
    .json(new ApiResponse(200, "Sync completed", { mode: factory.mode, results }));
});

exports.simulate = asyncHandler(async (req, res) => {
  const { source } = req.body || {};
  const result = await integrationService.simulate(source || null);
  res
    .status(201)
    .json(new ApiResponse(201, "Simulated lead created", result));
});

exports.status = asyncHandler(async (req, res) => {
  res.status(200).json(
    new ApiResponse(200, "Integration status", {
      mode: factory.mode,
      providers: factory.keys(),
      cron: env.CRON,
    }),
  );
});

const verifyWebhook = (req, key) => {
  const expected = env.WEBHOOK_SECRETS[key];
  if (!expected) return true;
  const sent = req.header("x-webhook-secret");
  if (sent !== expected) {
    throw new ApiError(401, "Invalid webhook secret");
  }
  return true;
};

exports.websiteWebhook = asyncHandler(async (req, res) => {
  verifyWebhook(req, "website");
  const result = await integrationService.ingestWebhook("website", req.body);
  res
    .status(201)
    .json(new ApiResponse(201, "Website lead received", result));
});

exports.metaWebhook = asyncHandler(async (req, res) => {
  verifyWebhook(req, "meta");
  const result = await integrationService.ingestWebhook("meta", req.body);
  res.status(201).json(new ApiResponse(201, "Meta lead received", result));
});

exports.googleWebhook = asyncHandler(async (req, res) => {
  verifyWebhook(req, "google");
  const result = await integrationService.ingestWebhook("google", req.body);
  res
    .status(201)
    .json(new ApiResponse(201, "Google lead received", result));
});
