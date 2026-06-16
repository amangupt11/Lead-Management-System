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
} = require("./user.controller");

/*
|--------------------------------------------------------------------------
| Profile
|--------------------------------------------------------------------------
*/
router.get("/profile", protect, getProfile);
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
