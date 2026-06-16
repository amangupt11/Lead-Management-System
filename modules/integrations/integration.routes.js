// modules/integrations/integration.routes.js
const express = require("express");

const router = express.Router();

const protect = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/role.middleware");

const {
  syncAll,
  simulate,
  status,
  websiteWebhook,
  metaWebhook,
  googleWebhook,
} = require("./integration.controller");

router.get("/status", protect, status);
router.post("/sync", protect, authorize("admin", "manager"), syncAll);
router.post("/simulate", protect, authorize("admin", "manager"), simulate);

module.exports = router;
module.exports.webhookRoutes = (() => {
  const r = express.Router();
  r.post("/website", websiteWebhook);
  r.post("/meta", metaWebhook);
  r.post("/google", googleWebhook);
  return r;
})();
