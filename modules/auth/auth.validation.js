// modules/auth/auth.validation.js
const { body } = require("express-validator");

const registerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role")
    .optional()
    .isIn(["admin", "manager", "sales"])
    .withMessage("Invalid role"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Valid email required"),
  body("password").notEmpty().withMessage("Password required"),
];

const refreshValidation = [
  body("refreshToken").notEmpty().withMessage("Refresh token required"),
];

module.exports = { registerValidation, loginValidation, refreshValidation };
