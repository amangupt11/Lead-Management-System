// modules/seeders/adminSeeder.js
require("dotenv").config();
const bcrypt = require("bcryptjs");

const User = require("../users/user.model");

const seedAdmin = async () => {
  const admin =
    await User.findOne({
      email:
        process.env.ADMIN_EMAIL,
    });

  if (admin) {
    console.log(
      "Admin already exists"
    );
    return;
  }

  const hashedPassword =
    await bcrypt.hash(
      process.env.ADMIN_PASSWORD,
      Number(
        process.env
          .BCRYPT_SALT_ROUNDS
      )
    );

  await User.create({
    name:
      process.env.ADMIN_NAME,
    email:
      process.env.ADMIN_EMAIL,
    password: hashedPassword,
    role: "admin",
  });

  console.log(
    "Admin seeded successfully"
  );
};

module.exports = seedAdmin;