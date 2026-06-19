// modules/users/user.routes.js
const express = require("express");
const router = express.Router();
const protect = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/role.middleware");
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getProfile,
  registerFcmToken,
  unregisterFcmToken,
} = require("./user.controller");
/*
|--------------------------------------------------------------------------
| Profile
|--------------------------------------------------------------------------
*/
router.get("/profile", protect, getProfile);
/*
|--------------------------------------------------------------------------
| FCM token registration (per-device)
|--------------------------------------------------------------------------
*/
router.post("/me/fcm-token", protect, registerFcmToken);
router.delete("/me/fcm-token", protect, unregisterFcmToken);
/*
|--------------------------------------------------------------------------
| Users Management
|--------------------------------------------------------------------------
*/
router.get("/", protect, authorize("admin", "manager"), getUsers);
router.get("/:id", protect, authorize("admin", "manager"), getUserById);
router.put("/:id", protect, authorize("admin"), updateUser);
router.delete("/:id", protect, authorize("admin"), deleteUser);
module.exports = router;
