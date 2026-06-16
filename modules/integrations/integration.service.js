// modules/integrations/integration.service.js
const Lead = require("../leads/lead.model");
const LeadActivity = require("../leads/leadActivity.model");
const notificationService = require("../notifications/notification.service");
const factory = require("./provider.factory");

const upsertLead = async (normalized, meta = {}) => {
  const filter = {};
  if (normalized.email) filter.email = normalized.email.toLowerCase();
  else filter.phone = normalized.phone;

  filter.source = normalized.source;

  const existing = await Lead.findOne(filter);
  if (existing) {
    return { lead: existing, created: false };
  }

  const lead = await Lead.create(normalized);

  await LeadActivity.create({
    leadId: lead._id,
    action: `created via ${meta.via || normalized.source}`,
    performedBy: meta.userId || null,
  });

  await notificationService.notifyNewLead(lead);

  return { lead, created: true };
};

const syncAll = async () => {
  const results = [];

  for (const provider of factory.all()) {
    const raws = await provider.fetchLeads(1);
    for (const r of raws) {
      const { lead, created } = await upsertLead(r, {
        via: `${provider.name}-sync`,
      });
      results.push({
        provider: provider.name,
        leadId: lead._id,
        created,
      });
    }
  }

  return results;
};

const simulate = async (sourceKey = null) => {
  const key =
    sourceKey ||
    factory.keys()[Math.floor(Math.random() * factory.keys().length)];
  const provider = factory.get(key);
  const [raw] = await provider.fetchLeads(1);
  const { lead, created } = await upsertLead(raw, {
    via: `${provider.name}-simulate`,
  });
  return { provider: provider.name, lead, created };
};

const ingestWebhook = async (providerKey, payload) => {
  const provider = factory.get(providerKey);
  const normalized = provider.normalize(payload);
  if (!normalized.name || !normalized.phone) {
    const e = new Error("Webhook payload missing name or phone");
    e.statusCode = 400;
    throw e;
  }
  return upsertLead(normalized, { via: `${providerKey}-webhook` });
};

module.exports = {
  syncAll,
  simulate,
  ingestWebhook,
  upsertLead,
};
