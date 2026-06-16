const syncGoogleLeads =
  async () => {
    return [
      {
        name: "Google User",
        email:
          "google@test.com",
        phone: "9876543210",
        source:
          "google_ads",
        campaign:
          "Search Campaign",
      },
    ];
  };

module.exports = {
  syncGoogleLeads,
};