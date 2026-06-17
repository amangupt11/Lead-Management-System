// modules/auth/auth.routes.js
const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();

const protect = require("../../middlewares/auth.middleware");
const validate = require("../../middlewares/validation.middleware");

const {
  registerValidation,
  loginValidation,
  refreshValidation,
} = require("./auth.validation");

const {
  register,
  login,
  refresh,
  logout,
  me,
} = require("./auth.controller");

const loginLimiter = rateLimit({
 windowMs: 15 * 60 * 1000, // 15 min
 max: 20, // 20 attempts
 standardHeaders: true,
 legacyHeaders: false,
 message: { success: false, message: "Too many login attempts, try later" },
});


router.post("/register", registerValidation, validate, register);
router.post("/login", loginLimiter, loginValidation, validate, login);
router.post("/refresh", refreshValidation, validate, refresh);
router.post("/logout", protect, logout);
router.get("/me", protect, me);

module.exports = router;
