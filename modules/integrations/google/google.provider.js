// modules/integrations/google/google.provider.js
const BaseProvider = require("../base.provider");
const { generateLead } = require("../dummy/dummy.data");

class GoogleProvider extends BaseProvider {
  constructor(mode = "dummy") {
    super("google");
    this.mode = mode;
  }

  async fetchLeads(count = 1) {
    if (this.mode === "dummy") {
      return Array.from({ length: count }, () => generateLead("google_ads"));
    }

    throw new Error("Google Ads live mode requires API credentials");
  }

  normalize(raw) {
    const userColumnData = raw.user_column_data || [];
    const col = (key) => {
      const c = userColumnData.find((x) => x.column_name === key);
      return c && (c.string_value || c.column_value);
    };

    return {
      name: col("FULL_NAME") || raw.name,
      email: col("EMAIL") || raw.email,
      phone: col("PHONE_NUMBER") || raw.phone,
      source: "google_ads",
      campaign: raw.campaign_name || raw.campaign || "Google Lead Form",
      keyword: col("KEYWORD") || raw.keyword || null,
      inquiry: col("inquiry") || raw.inquiry || "",
    };
  }
}

module.exports = GoogleProvider;
