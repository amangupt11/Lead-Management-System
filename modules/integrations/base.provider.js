// modules/integrations/base.provider.js
class BaseProvider {
  constructor(name) {
    this.name = name;
  }

  async fetchLeads() {
    throw new Error(`${this.name}: fetchLeads() not implemented`);
  }

  normalize(raw) {
    throw new Error(`${this.name}: normalize() not implemented`);
  }
}

module.exports = BaseProvider;
