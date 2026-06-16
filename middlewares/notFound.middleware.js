// middlewares/notFound.middleware.js - Middleware to handle 404 Not Found errors
const ApiError = require("../utils/ApiError");

const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};

module.exports = notFound;
