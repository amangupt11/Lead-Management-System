// modules/users/user.controller.js
const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");
const ApiError = require("../../utils/ApiError");
const User = require("./user.model");
exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").sort("-createdAt");
  res
    .status(200)
    .json(new ApiResponse(200, "Users fetched successfully", users));
});
exports.getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) throw new ApiError(404, "User not found");
  res.status(200).json(new ApiResponse(200, "User fetched successfully", user));
});
exports.updateUser = asyncHandler(async (req, res) => {
  if (req.body.password) {
    delete req.body.password;
  }
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).select("-password");
  if (!user) throw new ApiError(404, "User not found");
  res.status(200).json(new ApiResponse(200, "User updated successfully", user));
});
exports.deleteUser = asyncHandler(async (req, res) => {
  if (String(req.user._id) === String(req.params.id)) {
    throw new ApiError(400, "You cannot delete your own account");
  }
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new ApiError(404, "User not found");
  res.status(200).json(new ApiResponse(200, "User deleted successfully"));
});
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res
    .status(200)
    .json(new ApiResponse(200, "Profile fetched successfully", user));
});
/**
 * POST /users/me/fcm-token
 * Body: { token: string, platform?: "android" | "ios" }
 * Stores the caller's current FCM device token so the backend can target
 * push notifications at this specific device.
 */
exports.registerFcmToken = asyncHandler(async (req, res) => {
  const { token, platform } = req.body;
  if (!token || typeof token !== "string") {
    throw new ApiError(400, "FCM token is required");
  }
  const allowedPlatforms = ["android", "ios"];
  const safePlatform = allowedPlatforms.includes(platform)
    ? platform
    : "android";
  await User.findByIdAndUpdate(req.user._id, {
    fcmToken: token,
    fcmPlatform: safePlatform,
  });
  res.status(200).json(new ApiResponse(200, "FCM token registered"));
});
/**
 * DELETE /users/me/fcm-token
 * Clears the caller's stored FCM token (e.g. on logout).
 */
exports.unregisterFcmToken = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    fcmToken: null,
    fcmPlatform: null,
  });
  res.status(200).json(new ApiResponse(200, "FCM token unregistered"));
});
