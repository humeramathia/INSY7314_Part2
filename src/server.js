require("dotenv").config();

const fs = require("fs");
const https = require("https");
const path = require("path");

const app = require("./app");
const { PORT } = require("./config");
const { connectDB } = require("./config/db");

const keyPath = path.join(__dirname, "..", "certs", "key.pem");
const certPath = path.join(__dirname, "..", "certs", "cert.pem");

async function startServer() {
  try {
    await connectDB();

    if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
      console.error("HTTPS certificates not found.");
      console.error("Run: npm run certs");
      process.exit(1);
    }

    const options = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    };

    https.createServer(options, app).listen(PORT, () => {
      console.log(
        `HustleHub+ API listening on https://localhost:${PORT}`
      );
    });
  } catch (err) {
    console.error("HustleHub+ failed to start.");
    process.exit(1);
  }
}

startServer();