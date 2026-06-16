// middlewares/auth.middleware.js - Middleware to protect routes and authenticate users
const jwt = require("jsonwebtoken");

// local imports
const User = require("../modules/users/user.model");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new ApiError(401, "Access denied. No token provided.");
  }

  const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  const user = await User.findById(decoded.id);

  if (!user) {
    throw new ApiError(401, "User not found");
  }
  req.user = user;
  next();
});

module.exports = protect;
