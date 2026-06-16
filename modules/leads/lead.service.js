// modules/leads/lead.service.js
const Lead = require("./lead.model");
const LeadActivity = require("./leadActivity.model");
const ApiError = require("../../utils/ApiError");
const notificationService = require("../notifications/notification.service");

const logActivity = async (leadId, action, performedBy, meta = {}) => {
  try {
    await LeadActivity.create({ leadId, action, performedBy, meta });
  } catch (err) {
    console.error("activity log error:", err.message);
  }
};

const createLead = async (payload, actor = null) => {
  const lead = await Lead.create(payload);
  await logActivity(lead._id, "created", actor, { source: lead.source });
  await notificationService.notifyNewLead(lead);
  return lead;
};

const getLeads = async (queryParams) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    status,
    source,
    assignedTo,
    from,
    to,
  } = queryParams;

  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  if (status) query.status = status;
  if (source) query.source = source;
  if (assignedTo) query.assignedTo = assignedTo;
  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(from);
    if (to) query.createdAt.$lte = new Date(to);
  }

  const skip = (page - 1) * limit;

  const leads = await Lead.find(query)
    .populate("assignedTo", "name email role")
    .skip(skip)
    .limit(Number(limit))
    .sort("-createdAt");

  const total = await Lead.countDocuments(query);

  return {
    total,
    page: Number(page),
    limit: Number(limit),
    pages: Math.ceil(total / Number(limit)),
    leads,
  };
};

const getLeadById = async (id) => {
  const lead = await Lead.findById(id).populate(
    "assignedTo",
    "name email role",
  );
  if (!lead) throw new ApiError(404, "Lead not found");
  return lead;
};

const updateLead = async (id, payload, actor = null) => {
  const existing = await Lead.findById(id);
  if (!existing) throw new ApiError(404, "Lead not found");

  const before = { status: existing.status, assignedTo: existing.assignedTo };

  Object.assign(existing, payload);
  await existing.save();

  const changes = [];
  if (payload.status && payload.status !== before.status) {
    changes.push(`status: ${before.status} → ${payload.status}`);
  }
  if (
    payload.assignedTo &&
    String(payload.assignedTo) !== String(before.assignedTo)
  ) {
    changes.push(`assigned: ${before.assignedTo} → ${payload.assignedTo}`);
  }
  if (changes.length === 0) changes.push("updated");

  await logActivity(existing._id, changes.join("; "), actor, payload);

  return existing;
};

const deleteLead = async (id, actor = null) => {
  const lead = await Lead.findByIdAndDelete(id);
  if (!lead) throw new ApiError(404, "Lead not found");
  await logActivity(lead._id, "deleted", actor);
  return lead;
};

const assignLead = async (leadId, userId, actor = null) => {
  const lead = await Lead.findById(leadId);
  if (!lead) throw new ApiError(404, "Lead not found");

  lead.assignedTo = userId;
  await lead.save();

  await logActivity(lead._id, `assigned to user ${userId}`, actor, { userId });
  await notificationService.notifyAssignment(lead, userId);

  return lead.populate("assignedTo", "name email role");
};

const addRemark = async (leadId, message, actor = null) => {
  const lead = await Lead.findById(leadId);
  if (!lead) throw new ApiError(404, "Lead not found");

  lead.remarks.push({ message });
  await lead.save();

  await logActivity(lead._id, "remark added", actor, { message });

  return lead;
};

const getActivity = async (leadId) => {
  const items = await LeadActivity.find({ leadId })
    .sort("-createdAt")
    .populate("performedBy", "name email role");
  return items;
};

module.exports = {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  assignLead,
  addRemark,
  getActivity,
};
