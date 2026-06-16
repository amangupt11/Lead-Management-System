// modules/reports/report.routes.js
const express = require("express");

const router = express.Router();

const protect = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/role.middleware");

const { exportExcel, exportPdf } = require("./report.controller");

router.use(protect);
router.use(authorize("admin", "manager"));

router.get("/excel", exportExcel);
router.get("/pdf", exportPdf);

module.exports = router;
