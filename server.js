// server.js - entry point of the application
require("dotenv").config();

// local imports
const app = require("./app");
const env = require("./config/env");
const connectDB = require("./config/db");
const cronJobs = require("./modules/jobs/cron");

// start the server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`);
      console.log(`API base: http://localhost:${env.PORT}/api/${env.API_VERSION}`);
      console.log(`Docs: http://localhost:${env.PORT}/api-docs`);
      console.log(`Mode: INTEGRATION_MODE=${env.INTEGRATION_MODE}`);
    });

    cronJobs.start();
  } catch (error) {
    console.error("Startup error:", error);
    process.exit(1);
  }
};

// Start the server
startServer();
