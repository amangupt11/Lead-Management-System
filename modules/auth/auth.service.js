// modules/auth/auth.service.js
const bcrypt = require("bcryptjs");

const User = require("../users/user.model");
const ApiError = require("../../utils/ApiError");
const env = require("../../config/env");

const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../../services/jwt.service");

const sanitize = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const register = async (name, email, password, role = "sales") => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new ApiError(400, "Email already exists");

  const hashed = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);

  const user = await User.create({ name, email, password: hashed, role });
  return sanitize(user);
};

const login = async (email, password) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new ApiError(401, "Invalid credentials");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new ApiError(401, "Invalid credentials");

  if (user.isActive === false) {
    throw new ApiError(403, "Account is deactivated");
  }

  const payload = { id: user._id, role: user.role };

  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
    user: sanitize(user),
  };
};

const refresh = async (token) => {
  if (!token) throw new ApiError(400, "Refresh token required");

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (err) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(decoded.id);
  if (!user) throw new ApiError(401, "User not found");

  const payload = { id: user._id, role: user.role };
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

const logout = async () => {
  return { ok: true };
};

module.exports = { register, login, refresh, logout };
