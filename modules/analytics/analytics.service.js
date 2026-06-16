// modules/analytics/analytics.service.js
const Lead = require("../leads/lead.model");

const dateRange = (from, to) => {
  const range = {};
  if (from) range.$gte = new Date(from);
  if (to) range.$lte = new Date(to);
  return Object.keys(range).length ? { createdAt: range } : {};
};

const getDashboardStats = async (query = {}) => {
  const match = dateRange(query.from, query.to);

  const [total, n, c, f, conv, rej] = await Promise.all([
    Lead.countDocuments(match),
    Lead.countDocuments({ ...match, status: "new" }),
    Lead.countDocuments({ ...match, status: "contacted" }),
    Lead.countDocuments({ ...match, status: "follow_up" }),
    Lead.countDocuments({ ...match, status: "converted" }),
    Lead.countDocuments({ ...match, status: "rejected" }),
  ]);

  const conversionRate = total ? +((conv / total) * 100).toFixed(2) : 0;

  return {
    totalLeads: total,
    byStatus: {
      new: n,
      contacted: c,
      follow_up: f,
      converted: conv,
      rejected: rej,
    },
    conversionRate,
  };
};

const getBySource = async (query = {}) => {
  const match = dateRange(query.from, query.to);
  return Lead.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$source",
        total: { $sum: 1 },
        converted: {
          $sum: { $cond: [{ $eq: ["$status", "converted"] }, 1, 0] },
        },
      },
    },
    {
      $project: {
        _id: 0,
        source: "$_id",
        total: 1,
        converted: 1,
        conversionRate: {
          $cond: [
            { $eq: ["$total", 0] },
            0,
            {
              $round: [
                { $multiply: [{ $divide: ["$converted", "$total"] }, 100] },
                2,
              ],
            },
          ],
        },
      },
    },
    { $sort: { total: -1 } },
  ]);
};

const getByCampaign = async (query = {}) => {
  const match = dateRange(query.from, query.to);
  if (query.source) match.source = query.source;
  return Lead.aggregate([
    { $match: match },
    {
      $group: {
        _id: { source: "$source", campaign: "$campaign" },
        total: { $sum: 1 },
        converted: {
          $sum: { $cond: [{ $eq: ["$status", "converted"] }, 1, 0] },
        },
      },
    },
    {
      $project: {
        _id: 0,
        source: "$_id.source",
        campaign: "$_id.campaign",
        total: 1,
        converted: 1,
        conversionRate: {
          $cond: [
            { $eq: ["$total", 0] },
            0,
            {
              $round: [
                { $multiply: [{ $divide: ["$converted", "$total"] }, 100] },
                2,
              ],
            },
          ],
        },
      },
    },
    { $sort: { total: -1 } },
  ]);
};

const getFunnel = async (query = {}) => {
  const match = dateRange(query.from, query.to);
  const rows = await Lead.aggregate([
    { $match: match },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  const map = Object.fromEntries(rows.map((r) => [r._id, r.count]));
  const order = ["new", "contacted", "follow_up", "converted", "rejected"];
  return order.map((status) => ({ status, count: map[status] || 0 }));
};

const getTimeSeries = async (query = {}) => {
  const days = Math.min(Number(query.days || 30), 180);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return Lead.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        total: { $sum: 1 },
        converted: {
          $sum: { $cond: [{ $eq: ["$status", "converted"] }, 1, 0] },
        },
      },
    },
    { $project: { _id: 0, date: "$_id", total: 1, converted: 1 } },
    { $sort: { date: 1 } },
  ]);
};

const getUserPerformance = async (query = {}) => {
  const match = dateRange(query.from, query.to);
  return Lead.aggregate([
    { $match: { ...match, assignedTo: { $ne: null } } },
    {
      $group: {
        _id: "$assignedTo",
        total: { $sum: 1 },
        converted: {
          $sum: { $cond: [{ $eq: ["$status", "converted"] }, 1, 0] },
        },
        rejected: {
          $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        _id: 0,
        userId: "$_id",
        name: "$user.name",
        email: "$user.email",
        role: "$user.role",
        total: 1,
        converted: 1,
        rejected: 1,
        conversionRate: {
          $cond: [
            { $eq: ["$total", 0] },
            0,
            {
              $round: [
                { $multiply: [{ $divide: ["$converted", "$total"] }, 100] },
                2,
              ],
            },
          ],
        },
      },
    },
    { $sort: { total: -1 } },
  ]);
};

module.exports = {
  getDashboardStats,
  getBySource,
  getByCampaign,
  getFunnel,
  getTimeSeries,
  getUserPerformance,
};
