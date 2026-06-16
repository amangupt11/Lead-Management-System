const BaseProvider = require("../base.provider");
const { generateLead } = require("../dummy/dummy.data");

class WebsiteProvider extends BaseProvider {
  constructor(mode = "dummy") {
    super("website");
    this.mode = mode;
  }

  async fetchLeads(count = 1) {
    if (this.mode === "dummy") {
      return Array.from({ length: count }, () => generateLead("website"));
    }

    throw new Error("Website live mode not configured");
  }

  normalize(raw) {
    return {
      name: raw.name || raw.fullName || "Unknown",
      email: raw.email || null,
      phone: raw.phone || raw.mobile || raw.contact,
      source: "website",
      campaign: raw.campaign || raw.page || "Website Form",
      inquiry: raw.inquiry || raw.message || raw.notes || "",
    };
  }
}

module.exports = WebsiteProvider;
