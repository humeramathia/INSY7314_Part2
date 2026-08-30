require("dotenv").config();

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set. Copy .env.example to .env and set a secret.");
}

module.exports = {
  PORT,
  JWT_SECRET,
  JWT_EXPIRES_IN,
};
