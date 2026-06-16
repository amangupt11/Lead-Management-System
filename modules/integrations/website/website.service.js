const createWebsiteLead =
  async (payload) => {
    return {
      ...payload,
      source: "website",
    };
  };

module.exports = {
  createWebsiteLead,
};