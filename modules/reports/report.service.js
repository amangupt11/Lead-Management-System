// modules/reports/report.service.js
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const Lead = require("../leads/lead.model");

const buildQuery = (q = {}) => {
  const query = {};
  if (q.status) query.status = q.status;
  if (q.source) query.source = q.source;
  if (q.from || q.to) {
    query.createdAt = {};
    if (q.from) query.createdAt.$gte = new Date(q.from);
    if (q.to) query.createdAt.$lte = new Date(q.to);
  }
  return query;
};

const fetchLeads = (q) =>
  Lead.find(buildQuery(q))
    .populate("assignedTo", "name email")
    .sort("-createdAt");

const exportLeadsExcel = async (q = {}) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Leads");

  worksheet.columns = [
    { header: "Name", key: "name", width: 22 },
    { header: "Email", key: "email", width: 28 },
    { header: "Phone", key: "phone", width: 16 },
    { header: "Source", key: "source", width: 12 },
    { header: "Campaign", key: "campaign", width: 22 },
    { header: "Status", key: "status", width: 12 },
    { header: "Assigned To", key: "assignedTo", width: 22 },
    { header: "Inquiry", key: "inquiry", width: 40 },
    { header: "Created At", key: "createdAt", width: 22 },
  ];

  worksheet.getRow(1).font = { bold: true };

  const leads = await fetchLeads(q);

  leads.forEach((lead) => {
    worksheet.addRow({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      source: lead.source,
      campaign: lead.campaign,
      status: lead.status,
      assignedTo: lead.assignedTo ? lead.assignedTo.name : "—",
      inquiry: lead.inquiry,
      createdAt: lead.createdAt.toISOString().slice(0, 19).replace("T", " "),
    });
  });

  return workbook;
};

const streamLeadsPdf = async (q, res) => {
  const leads = await fetchLeads(q);

  const doc = new PDFDocument({ margin: 40, size: "A4" });
  doc.pipe(res);

  doc.fontSize(18).text("Lead Management Report", { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(10).fillColor("#666").text(`Generated: ${new Date().toISOString()}`, {
    align: "center",
  });
  if (q.from || q.to)
    doc.text(
      `Date range: ${q.from || "-"} → ${q.to || "-"}${q.source ? " | source=" + q.source : ""}${q.status ? " | status=" + q.status : ""}`,
      { align: "center" },
    );
  doc.moveDown(1);

  doc.fillColor("#000").fontSize(11);

  const headers = ["Name", "Phone", "Source", "Campaign", "Status", "Created"];
  const widths = [110, 80, 70, 110, 70, 80];
  const xStart = 40;

  const drawRow = (cells, opts = {}) => {
    const y = doc.y;
    let x = xStart;
    cells.forEach((cell, i) => {
      doc.text(String(cell || "—"), x + 2, y, {
        width: widths[i] - 4,
        ellipsis: true,
      });
      x += widths[i];
    });
    doc.moveDown(0.4);
    if (opts.line) {
      doc
        .moveTo(xStart, doc.y)
        .lineTo(xStart + widths.reduce((a, b) => a + b, 0), doc.y)
        .strokeColor("#cccccc")
        .stroke();
    }
  };

  doc.font("Helvetica-Bold");
  drawRow(headers, { line: true });
  doc.font("Helvetica");

  leads.forEach((lead) => {
    if (doc.y > 760) {
      doc.addPage();
      doc.font("Helvetica-Bold");
      drawRow(headers, { line: true });
      doc.font("Helvetica");
    }
    drawRow(
      [
        lead.name,
        lead.phone,
        lead.source,
        lead.campaign,
        lead.status,
        lead.createdAt.toISOString().slice(0, 10),
      ],
      { line: true },
    );
  });

  doc.moveDown(1);
  doc.fontSize(10).fillColor("#666").text(`Total: ${leads.length} leads`, {
    align: "right",
  });

  doc.end();
};

module.exports = { exportLeadsExcel, streamLeadsPdf };
