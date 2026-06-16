// modules/leads/lead.routes.js
const express = require("express");

const router = express.Router();

const protect = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/role.middleware");
const validate = require("../../middlewares/validation.middleware");

const { createLeadValidation } = require("./lead.validation");

const {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  assignLead,
  addRemark,
  getActivity,
} = require("./lead.controller");

router.use(protect);

router.get("/", getLeads);
router.get("/:id", getLeadById);
router.get("/:id/activity", getActivity);
router.post(
  "/",
  authorize("admin", "manager"),
  createLeadValidation,
  validate,
  createLead,
);
router.put("/:id", authorize("admin", "manager", "sales"), updateLead);
router.delete("/:id", authorize("admin"), deleteLead);
router.patch("/:id/assign", authorize("admin", "manager"), assignLead);
router.post(
  "/:id/remarks",
  authorize("admin", "manager", "sales"),
  addRemark,
);

module.exports = router;
