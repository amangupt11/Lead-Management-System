// modules/notifications/notification.routes.js
const express = require("express");

const router = express.Router();

const protect = require("../../middlewares/auth.middleware");

const {
  list,
  markRead,
  markAllRead,
  test,
} = require("./notification.controller");

router.use(protect);

router.get("/", list);
router.patch("/read-all", markAllRead);
router.patch("/:id/read", markRead);
router.post("/test", test);

module.exports = router;
