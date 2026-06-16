// modules/auth/auth.controller.js
const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");

const authService = require("./auth.service");

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const user = await authService.register(name, email, password, role);
  res
    .status(201)
    .json(new ApiResponse(201, "User registered successfully", user));
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const data = await authService.login(email, password);
  res.status(200).json(new ApiResponse(200, "Login successful", data));
});

exports.refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const data = await authService.refresh(refreshToken);
  res.status(200).json(new ApiResponse(200, "Token refreshed", data));
});

exports.logout = asyncHandler(async (req, res) => {
  await authService.logout();
  res.status(200).json(new ApiResponse(200, "Logged out successfully"));
});

exports.me = asyncHandler(async (req, res) => {
  res.status(200).json(
    new ApiResponse(200, "Current user", {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    }),
  );
});
