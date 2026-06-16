// modules/reports/report.controller.js
const asyncHandler = require("../../utils/asyncHandler");
const reportService = require("./report.service");

exports.exportExcel = asyncHandler(async (req, res) => {
  const workbook = await reportService.exportLeadsExcel(req.query);

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );

  res.setHeader(
    "Content-Disposition",
    `attachment; filename=leads-${Date.now()}.xlsx`,
  );

  await workbook.xlsx.write(res);

  res.end();
});

exports.exportPdf = asyncHandler(async (req, res) => {
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=leads-${Date.now()}.pdf`,
  );

  await reportService.streamLeadsPdf(req.query, res);
});
