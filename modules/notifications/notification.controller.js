// modules/notifications/notification.controller.js
const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");
const ApiError = require("../../utils/ApiError");

const notificationService = require("./notification.service");

exports.list = asyncHandler(async (req, res) => {
  const data = await notificationService.listForUser(req.user, req.query);
  res
    .status(200)
    .json(new ApiResponse(200, "Notifications fetched", data));
});

exports.markRead = asyncHandler(async (req, res) => {
  const notif = await notificationService.markRead(req.user, req.params.id);
  if (!notif) throw new ApiError(404, "Notification not found");
  res
    .status(200)
    .json(new ApiResponse(200, "Notification marked as read", notif));
});

exports.markAllRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllRead(req.user);
  res
    .status(200)
    .json(new ApiResponse(200, "All notifications marked as read", result));
});

exports.test = asyncHandler(async (req, res) => {
  const { title = "Test", message = "Test notification" } = req.body;
  const notif = await notificationService.create({
    title,
    message,
    userId: req.user._id,
    type: "system",
    audience: "user",
  });
  res
    .status(201)
    .json(new ApiResponse(201, "Test notification dispatched", notif));
});
