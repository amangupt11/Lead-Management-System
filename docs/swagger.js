//  docs/swagger.js
require("dotenv").config();
const swaggerJsdoc = require("swagger-jsdoc");
const env = require("../config/env");

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "LMS API",
      version: "1.0.0",
      description: "Lead Management System API Documentation",
    },

    servers: [
      {
        url: `${env.BASE_URL}/api/v1`,

      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },

    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: ["./modules/**/*.js", "./routes/**/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
