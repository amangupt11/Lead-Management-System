// docs/generate-api-sheet.js
require("dotenv").config();
const ExcelJS = require("exceljs");
const path = require("path");
const env = require("../config/env");

const ROOT = env.BASE_URL;              // for webhooks + system (not under /api/v1)
const BASE = `${env.BASE_URL}/api/v1`;  // for all module routes

const endpoints = [
  // ===================== AUTH =====================
  {
    module: "Auth",
    method: "POST",
    url: `${BASE}/auth/register`,
    auth: "No",
    role: "Public",
    headers: { "Content-Type": "application/json" },
    body: {
      name: "Aman Gupta",
      email: "aman@example.com",
      password: "Test@123",
      role: "sales",
    },
    response: {
      success: true,
      statusCode: 201,
      message: "User registered successfully",
      data: {
        id: "65f0a1b2c3d4e5f60718293a",
        name: "Aman Gupta",
        email: "aman@example.com",
        role: "sales",
      },
    },
    notes: "role is optional (defaults to sales). Register the first admin via seed script.",
  },
  {
    module: "Auth",
    method: "POST",
    url: `${BASE}/auth/login`,
    auth: "No",
    role: "Public",
    headers: { "Content-Type": "application/json" },
    body: { email: "admin@example.com", password: "Admin@123" },
    response: {
      success: true,
      statusCode: 200,
      message: "Login successful",
      data: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        user: {
          id: "65f0...",
          name: "Admin",
          email: "admin@example.com",
          role: "admin",
        },
      },
    },
    notes: "Use accessToken in Authorization: Bearer <token> for all protected routes.",
  },
  {
    module: "Auth",
    method: "POST",
    url: `${BASE}/auth/refresh`,
    auth: "No",
    role: "Public",
    headers: { "Content-Type": "application/json" },
    body: { refreshToken: "<refreshToken from login>" },
    response: {
      success: true,
      statusCode: 200,
      message: "Token refreshed",
      data: {
        accessToken: "<new-access-token>",
        refreshToken: "<new-refresh-token>",
      },
    },
    notes: "Returns rotated tokens.",
  },
  {
    module: "Auth",
    method: "POST",
    url: `${BASE}/auth/logout`,
    auth: "Yes",
    role: "Any",
    headers: { Authorization: "Bearer <accessToken>" },
    body: null,
    response: { success: true, statusCode: 200, message: "Logged out successfully" },
    notes: "Stateless logout — client should discard tokens.",
  },
  {
    module: "Auth",
    method: "GET",
    url: `${BASE}/auth/me`,
    auth: "Yes",
    role: "Any",
    headers: { Authorization: "Bearer <accessToken>" },
    body: null,
    response: {
      success: true,
      statusCode: 200,
      message: "Current user",
      data: { id: "...", name: "Admin", email: "admin@example.com", role: "admin" },
    },
    notes: "Returns the authenticated user from JWT.",
  },

  // ===================== USERS =====================
  {
    module: "Users",
    method: "GET",
    url: `${BASE}/users/profile`,
    auth: "Yes",
    role: "Any",
    headers: { Authorization: "Bearer <accessToken>" },
    body: null,
    response: {
      success: true,
      statusCode: 200,
      message: "Profile fetched successfully",
      data: { _id: "...", name: "Admin", email: "admin@example.com", role: "admin", isActive: true },
    },
    notes: "Current user profile.",
  },
  {
    module: "Users",
    method: "GET",
    url: `${BASE}/users`,
    auth: "Yes",
    role: "admin, manager",
    headers: { Authorization: "Bearer <accessToken>" },
    body: null,
    response: {
      success: true,
      statusCode: 200,
      message: "Users fetched successfully",
      data: [
        { _id: "...", name: "Admin", email: "admin@example.com", role: "admin", isActive: true },
      ],
    },
    notes: "List all users (password excluded).",
  },
  {
    module: "Users",
    method: "GET",
    url: `${BASE}/users/:id`,
    auth: "Yes",
    role: "admin, manager",
    headers: { Authorization: "Bearer <accessToken>" },
    body: null,
    response: {
      success: true,
      statusCode: 200,
      message: "User fetched successfully",
      data: { _id: "...", name: "Sales User", email: "sales@example.com", role: "sales" },
    },
    notes: ":id is a Mongo ObjectId.",
  },
  {
    module: "Users",
    method: "PUT",
    url: `${BASE}/users/:id`,
    auth: "Yes",
    role: "admin",
    headers: { Authorization: "Bearer <accessToken>", "Content-Type": "application/json" },
    body: { name: "Updated Name", role: "manager", isActive: true },
    response: {
      success: true,
      statusCode: 200,
      message: "User updated successfully",
      data: { _id: "...", name: "Updated Name", role: "manager" },
    },
    notes: "Password cannot be updated via this endpoint — it's stripped.",
  },
  {
    module: "Users",
    method: "DELETE",
    url: `${BASE}/users/:id`,
    auth: "Yes",
    role: "admin",
    headers: { Authorization: "Bearer <accessToken>" },
    body: null,
    response: { success: true, statusCode: 200, message: "User deleted successfully" },
    notes: "Cannot delete yourself.",
  },

  // ===================== LEADS =====================
  {
    module: "Leads",
    method: "GET",
    url: `${BASE}/leads?page=1&limit=10&search=aman&status=new&source=facebook&from=2026-06-01&to=2026-06-30`,
    auth: "Yes",
    role: "Any",
    headers: { Authorization: "Bearer <accessToken>" },
    body: null,
    response: {
      success: true,
      statusCode: 200,
      message: "Leads fetched successfully",
      data: {
        total: 25,
        page: 1,
        limit: 10,
        pages: 3,
        leads: [
          {
            _id: "...",
            name: "Aman Sharma",
            email: "aman@example.com",
            phone: "9999999999",
            source: "facebook",
            campaign: "Summer Promo",
            status: "new",
            assignedTo: { _id: "...", name: "Sales User", email: "sales@example.com", role: "sales" },
            remarks: [],
            createdAt: "2026-06-16T08:30:00.000Z",
          },
        ],
      },
    },
    notes: "All query params optional. status: new|contacted|follow_up|converted|rejected. source: website|facebook|instagram|google_ads.",
  },
  {
    module: "Leads",
    method: "GET",
    url: `${BASE}/leads/:id`,
    auth: "Yes",
    role: "Any",
    headers: { Authorization: "Bearer <accessToken>" },
    body: null,
    response: {
      success: true,
      statusCode: 200,
      message: "Lead fetched successfully",
      data: { _id: "...", name: "Aman Sharma", phone: "9999999999", status: "new" },
    },
    notes: "",
  },
  {
    module: "Leads",
    method: "GET",
    url: `${BASE}/leads/:id/activity`,
    auth: "Yes",
    role: "Any",
    headers: { Authorization: "Bearer <accessToken>" },
    body: null,
    response: {
      success: true,
      statusCode: 200,
      message: "Lead activity fetched",
      data: [
        { _id: "...", action: "created", performedBy: { name: "Admin", email: "admin@example.com" }, createdAt: "..." },
        { _id: "...", action: "assigned to user 65f0...", performedBy: { name: "Admin" } },
        { _id: "...", action: "status: new → contacted", performedBy: { name: "Sales User" } },
      ],
    },
    notes: "Audit trail of all changes to the lead.",
  },
  {
    module: "Leads",
    method: "POST",
    url: `${BASE}/leads`,
    auth: "Yes",
    role: "admin, manager",
    headers: { Authorization: "Bearer <accessToken>", "Content-Type": "application/json" },
    body: {
      name: "Manual Lead",
      email: "manual@example.com",
      phone: "9000000000",
      source: "website",
      campaign: "Manual Entry",
      inquiry: "Walk-in inquiry",
    },
    response: {
      success: true,
      statusCode: 201,
      message: "Lead created successfully",
      data: { _id: "...", name: "Manual Lead", source: "website", status: "new" },
    },
    notes: "source must be one of website|facebook|instagram|google_ads. Triggers new_lead notification.",
  },
  {
    module: "Leads",
    method: "PUT",
    url: `${BASE}/leads/:id`,
    auth: "Yes",
    role: "admin, manager, sales",
    headers: { Authorization: "Bearer <accessToken>", "Content-Type": "application/json" },
    body: { status: "contacted", campaign: "Updated Campaign" },
    response: {
      success: true,
      statusCode: 200,
      message: "Lead updated successfully",
      data: { _id: "...", status: "contacted" },
    },
    notes: "Status changes are logged to LeadActivity.",
  },
  {
    module: "Leads",
    method: "DELETE",
    url: `${BASE}/leads/:id`,
    auth: "Yes",
    role: "admin",
    headers: { Authorization: "Bearer <accessToken>" },
    body: null,
    response: { success: true, statusCode: 200, message: "Lead deleted successfully" },
    notes: "",
  },
  {
    module: "Leads",
    method: "PATCH",
    url: `${BASE}/leads/:id/assign`,
    auth: "Yes",
    role: "admin, manager",
    headers: { Authorization: "Bearer <accessToken>", "Content-Type": "application/json" },
    body: { userId: "<sales user _id>" },
    response: {
      success: true,
      statusCode: 200,
      message: "Lead assigned successfully",
      data: { _id: "...", assignedTo: { _id: "...", name: "Sales User", role: "sales" } },
    },
    notes: "Sends an in-app notification to the assignee.",
  },
  {
    module: "Leads",
    method: "POST",
    url: `${BASE}/leads/:id/remarks`,
    auth: "Yes",
    role: "admin, manager, sales",
    headers: { Authorization: "Bearer <accessToken>", "Content-Type": "application/json" },
    body: { message: "Called customer, will call again tomorrow at 4 PM" },
    response: {
      success: true,
      statusCode: 200,
      message: "Remark added successfully",
      data: { _id: "...", remarks: [{ message: "Called customer...", createdAt: "..." }] },
    },
    notes: "",
  },

  // ===================== ANALYTICS =====================
  {
    module: "Analytics",
    method: "GET",
    url: `${BASE}/analytics/dashboard?from=2026-06-01&to=2026-06-30`,
    auth: "Yes",
    role: "Any",
    headers: { Authorization: "Bearer <accessToken>" },
    body: null,
    response: {
      success: true,
      statusCode: 200,
      message: "Dashboard statistics fetched",
      data: {
        totalLeads: 124,
        byStatus: { new: 40, contacted: 35, follow_up: 20, converted: 22, rejected: 7 },
        conversionRate: 17.74,
      },
    },
    notes: "from/to are optional ISO dates.",
  },
  {
    module: "Analytics",
    method: "GET",
    url: `${BASE}/analytics/by-source`,
    auth: "Yes",
    role: "Any",
    headers: { Authorization: "Bearer <accessToken>" },
    body: null,
    response: {
      success: true,
      statusCode: 200,
      message: "Leads by source",
      data: [
        { source: "facebook", total: 45, converted: 10, conversionRate: 22.22 },
        { source: "google_ads", total: 32, converted: 8, conversionRate: 25 },
        { source: "instagram", total: 27, converted: 3, conversionRate: 11.11 },
        { source: "website", total: 20, converted: 1, conversionRate: 5 },
      ],
    },
    notes: "",
  },
  {
    module: "Analytics",
    method: "GET",
    url: `${BASE}/analytics/by-campaign?source=facebook`,
    auth: "Yes",
    role: "Any",
    headers: { Authorization: "Bearer <accessToken>" },
    body: null,
    response: {
      success: true,
      statusCode: 200,
      message: "Leads by campaign",
      data: [
        { source: "facebook", campaign: "Summer Promo", total: 18, converted: 5, conversionRate: 27.78 },
        { source: "facebook", campaign: "Lead Gen FB", total: 15, converted: 3, conversionRate: 20 },
      ],
    },
    notes: "source filter optional.",
  },
  {
    module: "Analytics",
    method: "GET",
    url: `${BASE}/analytics/funnel`,
    auth: "Yes",
    role: "Any",
    headers: { Authorization: "Bearer <accessToken>" },
    body: null,
    response: {
      success: true,
      statusCode: 200,
      message: "Conversion funnel",
      data: [
        { status: "new", count: 40 },
        { status: "contacted", count: 35 },
        { status: "follow_up", count: 20 },
        { status: "converted", count: 22 },
        { status: "rejected", count: 7 },
      ],
    },
    notes: "Ordered by funnel stage.",
  },
  {
    module: "Analytics",
    method: "GET",
    url: `${BASE}/analytics/timeseries?days=30`,
    auth: "Yes",
    role: "Any",
    headers: { Authorization: "Bearer <accessToken>" },
    body: null,
    response: {
      success: true,
      statusCode: 200,
      message: "Time series",
      data: [
        { date: "2026-06-14", total: 5, converted: 1 },
        { date: "2026-06-15", total: 7, converted: 2 },
        { date: "2026-06-16", total: 4, converted: 0 },
      ],
    },
    notes: "days defaults to 30, max 180.",
  },
  {
    module: "Analytics",
    method: "GET",
    url: `${BASE}/analytics/users-performance`,
    auth: "Yes",
    role: "admin, manager",
    headers: { Authorization: "Bearer <accessToken>" },
    body: null,
    response: {
      success: true,
      statusCode: 200,
      message: "User performance",
      data: [
        { userId: "...", name: "Sales User 1", email: "s1@example.com", role: "sales", total: 30, converted: 8, rejected: 2, conversionRate: 26.67 },
      ],
    },
    notes: "Only includes assigned leads.",
  },

  // ===================== REPORTS =====================
  {
    module: "Reports",
    method: "GET",
    url: `${BASE}/reports/excel?from=2026-06-01&to=2026-06-30&source=facebook&status=converted`,
    auth: "Yes",
    role: "admin, manager",
    headers: { Authorization: "Bearer <accessToken>" },
    body: null,
    response: "<Binary stream: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet — Content-Disposition: attachment; filename=leads-<ts>.xlsx>",
    notes: "All query filters optional. Returns an .xlsx file.",
  },
  {
    module: "Reports",
    method: "GET",
    url: `${BASE}/reports/pdf?from=2026-06-01&to=2026-06-30&source=facebook`,
    auth: "Yes",
    role: "admin, manager",
    headers: { Authorization: "Bearer <accessToken>" },
    body: null,
    response: "<Binary stream: application/pdf — Content-Disposition: attachment; filename=leads-<ts>.pdf>",
    notes: "All query filters optional. Returns a .pdf file.",
  },

  // ===================== NOTIFICATIONS =====================
  {
    module: "Notifications",
    method: "GET",
    url: `${BASE}/notifications?page=1&limit=20&unread=true`,
    auth: "Yes",
    role: "Any",
    headers: { Authorization: "Bearer <accessToken>" },
    body: null,
    response: {
      success: true,
      statusCode: 200,
      message: "Notifications fetched",
      data: {
        total: 12,
        page: 1,
        limit: 20,
        items: [
          {
            _id: "...",
            title: "New lead received",
            message: "Aman Sharma (facebook) — 9999999999",
            type: "new_lead",
            isRead: false,
            audience: "role",
            role: "manager",
            createdAt: "...",
          },
        ],
      },
    },
    notes: "Returns notifications addressed to the user, their role, or all.",
  },
  {
    module: "Notifications",
    method: "PATCH",
    url: `${BASE}/notifications/:id/read`,
    auth: "Yes",
    role: "Any",
    headers: { Authorization: "Bearer <accessToken>" },
    body: null,
    response: {
      success: true,
      statusCode: 200,
      message: "Notification marked as read",
      data: { _id: "...", isRead: true },
    },
    notes: "",
  },
  {
    module: "Notifications",
    method: "PATCH",
    url: `${BASE}/notifications/read-all`,
    auth: "Yes",
    role: "Any",
    headers: { Authorization: "Bearer <accessToken>" },
    body: null,
    response: {
      success: true,
      statusCode: 200,
      message: "All notifications marked as read",
      data: { modified: 7 },
    },
    notes: "",
  },
  {
    module: "Notifications",
    method: "POST",
    url: `${BASE}/notifications/test`,
    auth: "Yes",
    role: "Any",
    headers: { Authorization: "Bearer <accessToken>", "Content-Type": "application/json" },
    body: { title: "Hello", message: "Manual test notification" },
    response: {
      success: true,
      statusCode: 201,
      message: "Test notification dispatched",
      data: { _id: "...", title: "Hello", message: "Manual test notification" },
    },
    notes: "Useful for verifying the FCM stub logs.",
  },

  // ===================== INTEGRATIONS =====================
  {
    module: "Integrations",
    method: "GET",
    url: `${BASE}/integrations/status`,
    auth: "Yes",
    role: "Any",
    headers: { Authorization: "Bearer <accessToken>" },
    body: null,
    response: {
      success: true,
      statusCode: 200,
      message: "Integration status",
      data: {
        mode: "dummy",
        providers: ["website", "meta", "google"],
        cron: { LEAD_SIMULATOR: true, FOLLOWUP_REMINDER: true, DAILY_SUMMARY: true },
      },
    },
    notes: "",
  },
  {
    module: "Integrations",
    method: "POST",
    url: `${BASE}/integrations/sync`,
    auth: "Yes",
    role: "admin, manager",
    headers: { Authorization: "Bearer <accessToken>" },
    body: null,
    response: {
      success: true,
      statusCode: 200,
      message: "Sync completed",
      data: {
        mode: "dummy",
        results: [
          { provider: "website", leadId: "...", created: true },
          { provider: "meta", leadId: "...", created: true },
          { provider: "google", leadId: "...", created: true },
        ],
      },
    },
    notes: "Manually fan out to all providers and pull one lead each.",
  },
  {
    module: "Integrations",
    method: "POST",
    url: `${BASE}/integrations/simulate`,
    auth: "Yes",
    role: "admin, manager",
    headers: { Authorization: "Bearer <accessToken>", "Content-Type": "application/json" },
    body: { source: "website" },
    response: {
      success: true,
      statusCode: 201,
      message: "Simulated lead created",
      data: {
        provider: "website",
        lead: { _id: "...", name: "Aarav Sharma", source: "website" },
        created: true,
      },
    },
    notes: "source is optional. If omitted, picks a random provider. source values: website|meta|google.",
  },

  // ===================== WEBHOOKS =====================
  {
    module: "Webhooks",
    method: "POST",
    url: `${ROOT}/webhooks/website`,
    auth: "Webhook secret",
    role: "External",
    headers: { "Content-Type": "application/json", "x-webhook-secret": "dummy-website-secret" },
    body: {
      name: "Website Visitor",
      email: "visitor@example.com",
      phone: "9876543210",
      campaign: "Pricing Page",
      inquiry: "Need quote for 5-car booking",
    },
    response: {
      success: true,
      statusCode: 201,
      message: "Website lead received",
      data: { lead: { _id: "...", source: "website" }, created: true },
    },
    notes: "No /api/v1 prefix. Send x-webhook-secret header matching .env WEBHOOK_WEBSITE_SECRET.",
  },
  {
    module: "Webhooks",
    method: "POST",
    url: `${ROOT}/webhooks/meta`,
    auth: "Webhook secret",
    role: "External",
    headers: { "Content-Type": "application/json", "x-webhook-secret": "dummy-meta-secret" },
    body: {
      platform: "facebook",
      campaign_name: "Summer Promo",
      adset_name: "Adset A",
      field_data: [
        { name: "full_name", values: ["Meta Lead"] },
        { name: "email", values: ["metalead@example.com"] },
        { name: "phone_number", values: ["9123456780"] },
      ],
    },
    response: {
      success: true,
      statusCode: 201,
      message: "Meta lead received",
      data: { lead: { _id: "...", source: "facebook" }, created: true },
    },
    notes: "Mimics Meta Graph API leadgen webhook payload shape.",
  },
  {
    module: "Webhooks",
    method: "POST",
    url: `${ROOT}/webhooks/google`,
    auth: "Webhook secret",
    role: "External",
    headers: { "Content-Type": "application/json", "x-webhook-secret": "dummy-google-secret" },
    body: {
      campaign_name: "Search - Cabs",
      user_column_data: [
        { column_name: "FULL_NAME", string_value: "Google Lead" },
        { column_name: "EMAIL", string_value: "googlelead@example.com" },
        { column_name: "PHONE_NUMBER", string_value: "9112233445" },
      ],
    },
    response: {
      success: true,
      statusCode: 201,
      message: "Google lead received",
      data: { lead: { _id: "...", source: "google_ads" }, created: true },
    },
    notes: "Mimics Google Ads Lead Form webhook payload.",
  },

  // ===================== HEALTH / ROOT =====================
  {
    module: "System",
    method: "GET",
    url: `${ROOT}/`,
    auth: "No",
    role: "Public",
    headers: {},
    body: null,
    response: {
      success: true,
      message: "LMS API Running",
      version: "v1",
      integration_mode: "dummy",
    },
    notes: "Root info.",
  },
  {
    module: "System",
    method: "GET",
    url: `${ROOT}/health`,
    auth: "No",
    role: "Public",
    headers: {},
    body: null,
    response: { success: true, uptime: 12.34, timestamp: "..." },
    notes: "Health check.",
  },
  {
    module: "System",
    method: "GET",
    url: `${ROOT}/api-docs`,
    auth: "No",
    role: "Public",
    headers: {},
    body: null,
    response: "<HTML: Swagger UI>",
    notes: "Interactive API docs.",
  },
];

const stringify = (val) => {
  if (val === null || val === undefined) return "";
  if (typeof val === "string") return val;
  return JSON.stringify(val, null, 2);
};

const run = async () => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "LMS Backend";
  workbook.created = new Date();

  // ============ Sheet 1: API Endpoints ============
  const ws = workbook.addWorksheet("API Endpoints", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  ws.columns = [
    { header: "#", key: "n", width: 5 },
    { header: "Module", key: "module", width: 14 },
    { header: "Method", key: "method", width: 9 },
    { header: "URL", key: "url", width: 70 },
    { header: "Auth", key: "auth", width: 14 },
    { header: "Role", key: "role", width: 22 },
    { header: "Headers", key: "headers", width: 45 },
    { header: "Request Body", key: "body", width: 55 },
    { header: "Sample Response", key: "response", width: 70 },
    { header: "Notes", key: "notes", width: 50 },
  ];

  ws.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  ws.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1F4E78" },
  };
  ws.getRow(1).alignment = { vertical: "middle", horizontal: "left" };

  endpoints.forEach((ep, i) => {
    ws.addRow({
      n: i + 1,
      module: ep.module,
      method: ep.method,
      url: ep.url,
      auth: ep.auth,
      role: ep.role,
      headers: stringify(ep.headers),
      body: stringify(ep.body),
      response: stringify(ep.response),
      notes: ep.notes || "",
    });
  });

  ws.eachRow((row, idx) => {
    if (idx === 1) return;
    row.alignment = { vertical: "top", wrapText: true };
    row.font = { name: "Consolas", size: 10 };
    // Color the method cell by verb
    const methodCell = row.getCell("method");
    const colorMap = {
      GET: "FF2E7D32",
      POST: "FFEF6C00",
      PUT: "FF1565C0",
      PATCH: "FF6A1B9A",
      DELETE: "FFC62828",
    };
    methodCell.font = { bold: true, color: { argb: colorMap[methodCell.value] || "FF000000" } };
    // Alternating row tint
    if (idx % 2 === 0) {
      row.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF5F8FA" },
      };
    }
  });

  // ============ Sheet 2: Setup / Auth flow ============
  const setup = workbook.addWorksheet("Setup & Auth Flow");

  setup.columns = [
    { header: "Step", key: "step", width: 6 },
    { header: "What to do", key: "what", width: 50 },
    { header: "Command / Endpoint", key: "cmd", width: 60 },
    { header: "Expected outcome", key: "out", width: 60 },
  ];
  setup.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  setup.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1F4E78" },
  };

  const setupSteps = [
    [1, "Install dependencies", "npm install", "node_modules populated"],
    [2, "Configure .env", "Edit MONGODB_URI, JWT secrets, ADMIN_* if needed", "All env vars present"],
    [3, "Seed admin + sample leads", "npm run seed", "Admin user + 4 sample leads inserted"],
    [4, "Start dev server", "npm run dev", "Server on :5000, cron jobs scheduled"],
    [5, "Login as admin", "POST /api/v1/auth/login { email: admin@example.com, password: Admin@123 }", "accessToken returned"],
    [6, "Set Postman/Insomnia env variable", "Save accessToken; use Authorization: Bearer {{accessToken}}", "Subsequent calls authorized"],
    [7, "Trigger a fake lead", "POST /api/v1/integrations/simulate { source: website }", "Lead created, notification emitted"],
    [8, "Manual sync from all providers", "POST /api/v1/integrations/sync", "3 leads (one per provider)"],
    [9, "Check dashboard analytics", "GET /api/v1/analytics/dashboard", "Counts updated"],
    [10, "Download Excel report", "GET /api/v1/reports/excel", "leads-<ts>.xlsx file"],
    [11, "Test inbound webhook (no auth header)", "POST /webhooks/website with x-webhook-secret: dummy-website-secret", "Lead saved, source=website"],
    [12, "Watch cron output", "Logs every 2 min: [cron:lead-simulator]", "Auto leads flowing in"],
  ];

  setupSteps.forEach(([s, w, c, o]) => {
    setup.addRow({ step: s, what: w, cmd: c, out: o });
  });

  setup.eachRow((row, idx) => {
    if (idx === 1) return;
    row.alignment = { vertical: "top", wrapText: true };
    row.font = { name: "Consolas", size: 10 };
  });

  // ============ Sheet 3: Mongo Collections cheat-sheet ============
  const mongo = workbook.addWorksheet("Mongo Collections");

  mongo.columns = [
    { header: "Collection", key: "col", width: 18 },
    { header: "Field", key: "field", width: 18 },
    { header: "Type", key: "type", width: 22 },
    { header: "Notes", key: "notes", width: 60 },
  ];
  mongo.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  mongo.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1F4E78" },
  };

  const schemaRows = [
    ["users", "name", "String", "required"],
    ["users", "email", "String (unique)", "required, lowercased"],
    ["users", "password", "String", "bcrypt hashed, select:false"],
    ["users", "role", "Enum", "admin | manager | sales (default: sales)"],
    ["users", "isActive", "Boolean", "default: true"],
    ["", "", "", ""],
    ["leads", "name", "String", "required"],
    ["leads", "email", "String", "optional, lowercased"],
    ["leads", "phone", "String", "required"],
    ["leads", "source", "Enum", "website | facebook | instagram | google_ads"],
    ["leads", "campaign", "String", "optional"],
    ["leads", "inquiry", "String", "optional"],
    ["leads", "status", "Enum", "new | contacted | follow_up | converted | rejected (default: new)"],
    ["leads", "assignedTo", "ObjectId (User)", "null until assigned"],
    ["leads", "remarks", "Array<{message, createdAt}>", "free-text notes"],
    ["", "", "", ""],
    ["leadactivities", "leadId", "ObjectId (Lead)", "required"],
    ["leadactivities", "action", "String", "e.g. 'created', 'status: new → contacted', 'assigned to user X'"],
    ["leadactivities", "meta", "Mixed", "extra payload (status change, message, etc.)"],
    ["leadactivities", "performedBy", "ObjectId (User)", "actor (null for system / cron)"],
    ["", "", "", ""],
    ["notifications", "title", "String", "required"],
    ["notifications", "message", "String", "required"],
    ["notifications", "userId", "ObjectId (User)", "target user (null for role/all)"],
    ["notifications", "type", "Enum", "new_lead | assignment | follow_up_reminder | daily_summary | system"],
    ["notifications", "leadId", "ObjectId (Lead)", "optional"],
    ["notifications", "isRead", "Boolean", "default: false"],
    ["notifications", "audience", "Enum", "user | role | all"],
    ["notifications", "role", "String", "when audience=role: admin|manager|sales"],
  ];

  schemaRows.forEach((r) =>
    mongo.addRow({ col: r[0], field: r[1], type: r[2], notes: r[3] }),
  );

  mongo.eachRow((row, idx) => {
    if (idx === 1) return;
    row.alignment = { vertical: "top", wrapText: true };
    row.font = { name: "Consolas", size: 10 };
    if (!row.getCell("col").value) {
      row.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE6E6E6" },
      };
    }
  });

  const outPath = path.join(__dirname, "API_Test_Sheet.xlsx");
  await workbook.xlsx.writeFile(outPath);
  console.log(`Wrote: ${outPath}`);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
