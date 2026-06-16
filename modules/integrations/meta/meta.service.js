const syncMetaLeads =
  async () => {
    return [
      {
        name: "Meta User",
        email: "meta@test.com",
        phone: "1234567890",
        source: "facebook",
        campaign:
          "Summer Campaign",
      },
    ];
  };

module.exports = {
  syncMetaLeads,
};