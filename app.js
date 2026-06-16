// app.js - Main application file for the LMS API
// dependency imports
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");

// local imports
const env = require("./config/env");
const swaggerSpec = require("./docs/swagger");
const routes = require("./routes");
const { webhookRoutes } = require("./modules/integrations/integration.routes");
const notFound = require("./middlewares/notFound.middleware");
const errorHandler = require("./middlewares/error.middleware");

// initialize express app
const app = express();

// middlewares
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// rate limiter - 300 requests per minute
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
// apply rate limiter to all API routes
app.use(`/api/${env.API_VERSION}`, apiLimiter);

// basic routes
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "LMS API Running",
    version: env.API_VERSION,
    integration_mode: env.INTEGRATION_MODE,
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

// API docs route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/webhooks", webhookRoutes);
app.use(`/api/${env.API_VERSION}`, routes);

// 404 handler and error handler
app.use(notFound);
app.use(errorHandler);

// export app for server.js
module.exports = app;
