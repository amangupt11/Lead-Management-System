// middlewares/role.middleware.js - Middleware to check user roles and authorize access to routes
const ApiError = require("../utils/ApiError");

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, "You are not authorized to access this resource");
    }

    next();
  };
};

module.exports = authorize;
