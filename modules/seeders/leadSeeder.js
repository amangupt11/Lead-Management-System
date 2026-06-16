// modules/seeders/leadSeeder.js
const Lead = require("../leads/lead.model");

const seedLeads = async () => {
  const existing = await Lead.countDocuments();

  if (existing > 0) {
    console.log("Leads already seeded — skipping");
    return;
  }

  const leads = [
    {
      name: "John Doe",
      email: "john@test.com",
      phone: "1111111111",
      source: "facebook",
      campaign: "Summer Promo",
      inquiry: "Interested in city tour",
      status: "new",
    },
    {
      name: "Sarah Wilson",
      email: "sarah@test.com",
      phone: "2222222222",
      source: "instagram",
      campaign: "Reels Campaign",
      inquiry: "Group booking inquiry",
      status: "contacted",
    },
    {
      name: "Mike Ross",
      email: "mike@test.com",
      phone: "3333333333",
      source: "google_ads",
      campaign: "Search - Cabs",
      inquiry: "Airport transfer",
      status: "converted",
    },
    {
      name: "Alex Brown",
      email: "alex@test.com",
      phone: "4444444444",
      source: "website",
      campaign: "Homepage Form",
      inquiry: "Wedding car rental",
      status: "follow_up",
    },
  ];

  await Lead.insertMany(leads);

  console.log("Lead Seeder Executed");
};

module.exports = seedLeads;