// modules/leads/lead.validation.js
const { body } = require("express-validator");

const createLeadValidation =
  [
    body("name")
      .notEmpty()
      .withMessage(
        "Name is required"
      ),

    body("phone")
      .notEmpty()
      .withMessage(
        "Phone is required"
      ),

    body("source")
      .isIn([
        "website",
        "facebook",
        "instagram",
        "google_ads",
      ])
      .withMessage(
        "Invalid lead source"
      ),
  ];

module.exports = {
  createLeadValidation,
};