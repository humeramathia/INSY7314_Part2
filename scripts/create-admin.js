require("dotenv").config();

const mongoose = require("mongoose");
const { connectDB } = require("../src/config/db");
const { createUser, findByEmail } = require("../src/models/userModel");
const { hashPassword } = require("../src/utils/password");

async function createAdmin() {
  const name = process.env.ADMIN_NAME || "HustleHub Admin";
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env, then run: npm run create-admin");
    process.exit(1);
  }

  await connectDB();

  const existing = await findByEmail(email);

  if (existing) {
    if (existing.role === "admin") {
      console.log("Admin account already exists for that email.");
    } else {
      console.error("That email is already registered as", existing.role + ".");
      process.exitCode = 1;
    }

    await mongoose.disconnect();
    return;
  }

  await createUser({
    name: String(name).trim(),
    email,
    password: await hashPassword(password),
    role: "admin",
  });

  console.log("Admin account created. Sign in on the website with that email.");
  await mongoose.disconnect();
}

createAdmin().catch(async (err) => {
  console.error("Could not create admin account.");
  console.error(err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
