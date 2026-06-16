// modules/auth/auth.routes.js
const express = require("express");

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

router.post("/register", registerValidation, validate, register);
router.post("/login", loginValidation, validate, login);
router.post("/refresh", refreshValidation, validate, refresh);
router.post("/logout", protect, logout);
router.get("/me", protect, me);

module.exports = router;
