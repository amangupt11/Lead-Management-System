const BaseProvider = require("../base.provider");
const { generateLead, pick } = require("../dummy/dummy.data");

class MetaProvider extends BaseProvider {
  constructor(mode = "dummy") {
    super("meta");
    this.mode = mode;
  }

  async fetchLeads(count = 1) {
    if (this.mode === "dummy") {
      return Array.from({ length: count }, () =>
        generateLead(pick(["facebook", "instagram"])),
      );
    }

    throw new Error("Meta live mode requires Graph API token");
  }

  normalize(raw) {
    const fieldData = raw.field_data || [];
    const get = (key) => {
      const f = fieldData.find((x) => x.name === key);
      return f && f.values && f.values[0];
    };

    const platform = raw.platform === "instagram" ? "instagram" : "facebook";

    return {
      name: get("full_name") || raw.name,
      email: get("email") || raw.email,
      phone: get("phone_number") || raw.phone,
      source: platform,
      campaign: raw.campaign_name || raw.adset_name || "Meta Lead Ad",
      inquiry: get("inquiry") || raw.inquiry || "",
    };
  }
}

module.exports = MetaProvider;
