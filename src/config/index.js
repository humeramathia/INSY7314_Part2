require("dotenv").config();

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
const MONGODB_URI = process.env.MONGODB_URI;
const CORS_ORIGINS = String(
  process.env.CORS_ORIGINS ||
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:8080,http://127.0.0.1:8080"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET is not set. Copy .env.example to .env and set a secret."
  );
}

if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI is not set. Copy .env.example to .env and set the MongoDB connection URI."
  );
}

module.exports = {
  PORT,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  MONGODB_URI,
  CORS_ORIGINS,
};