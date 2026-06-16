// modules/seeders/index.js
require("dotenv").config();

const connectDB = require("../../config/db");
const seedAdmin = require("./adminSeeder");
const seedLeads = require("./leadSeeder");

const run = async () => {
  try {
    await connectDB();

    await seedAdmin();
    await seedLeads();

    console.log("All seeders executed");
    process.exit(0);
  } catch (err) {
    console.error("Seeder error:", err);
    process.exit(1);
  }
};

run();
