// modules/integrations/provider.factory.js
const env = require("../../config/env");

const WebsiteProvider = require("./website/website.provider");
const MetaProvider = require("./meta/meta.provider");
const GoogleProvider = require("./google/google.provider");

const mode = env.INTEGRATION_MODE;

const providers = {
  website: new WebsiteProvider(mode),
  meta: new MetaProvider(mode),
  google: new GoogleProvider(mode),
};

const get = (key) => {
  const p = providers[key];
  if (!p) {
    throw new Error(`Unknown provider: ${key}`);
  }
  return p;
};

const all = () => Object.values(providers);

const keys = () => Object.keys(providers);

module.exports = { get, all, keys, mode };
