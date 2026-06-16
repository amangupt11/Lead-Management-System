// modules/leads/lead.controller.js
const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");

const leadService = require("./lead.service");

exports.createLead = asyncHandler(async (req, res) => {
  const lead = await leadService.createLead(req.body, req.user._id);
  res
    .status(201)
    .json(new ApiResponse(201, "Lead created successfully", lead));
});

exports.getLeads = asyncHandler(async (req, res) => {
  const data = await leadService.getLeads(req.query);
  res
    .status(200)
    .json(new ApiResponse(200, "Leads fetched successfully", data));
});

exports.getLeadById = asyncHandler(async (req, res) => {
  const lead = await leadService.getLeadById(req.params.id);
  res
    .status(200)
    .json(new ApiResponse(200, "Lead fetched successfully", lead));
});

exports.updateLead = asyncHandler(async (req, res) => {
  const lead = await leadService.updateLead(
    req.params.id,
    req.body,
    req.user._id,
  );
  res
    .status(200)
    .json(new ApiResponse(200, "Lead updated successfully", lead));
});

exports.deleteLead = asyncHandler(async (req, res) => {
  await leadService.deleteLead(req.params.id, req.user._id);
  res.status(200).json(new ApiResponse(200, "Lead deleted successfully"));
});

exports.assignLead = asyncHandler(async (req, res) => {
  const lead = await leadService.assignLead(
    req.params.id,
    req.body.userId,
    req.user._id,
  );
  res
    .status(200)
    .json(new ApiResponse(200, "Lead assigned successfully", lead));
});

exports.addRemark = asyncHandler(async (req, res) => {
  const lead = await leadService.addRemark(
    req.params.id,
    req.body.message,
    req.user._id,
  );
  res
    .status(200)
    .json(new ApiResponse(200, "Remark added successfully", lead));
});

exports.getActivity = asyncHandler(async (req, res) => {
  const items = await leadService.getActivity(req.params.id);
  res
    .status(200)
    .json(new ApiResponse(200, "Lead activity fetched", items));
});
