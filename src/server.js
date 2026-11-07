require("dotenv").config();

const fs = require("fs");
const https = require("https");
const path = require("path");

const { logger } = require("./utils/logger");
const app = require("./app");
const { PORT } = require("./config");
const { connectDB } = require("./config/db");

const keyPath = path.join(__dirname, "..", "certs", "key.pem");
const certPath = path.join(__dirname, "..", "certs", "cert.pem");

// Errors that escape every try/catch are still recorded before the process exits.
process.on("unhandledRejection", (reason) => {
  logger.error({
    message: "process.unhandled_rejection",
    event: "process.unhandled_rejection",
    category: "error",
    errorMessage: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined,
  });
});

process.on("uncaughtException", (err) => {
  logger.error({
    message: "process.uncaught_exception",
    event: "process.uncaught_exception",
    category: "error",
    errorName: err.name,
    errorMessage: err.message,
    stack: err.stack,
  });
  // State is unknown after an uncaught exception, so stop and let Docker restart.
  logger.on("finish", () => process.exit(1));
  logger.end();
  setTimeout(() => process.exit(1), 1000).unref();
});

async function startServer() {
  try {
    await connectDB();

    if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
      logger.error({
        message: "server.start.failed",
        event: "server.start.failed",
        category: "error",
        reason: "https_certificates_missing",
        hint: "Run: npm run certs",
      });
      process.exit(1);
    }

    const options = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    };

    https.createServer(options, app).listen(PORT, () => {
      logger.info({
        message: `HustleHub+ API listening on https://localhost:${PORT}`,
        event: "server.started",
        category: "system",
        port: Number(PORT),
        nodeEnv: process.env.NODE_ENV || "development",
      });
    });
  } catch (err) {
    logger.error({
      message: "server.start.failed",
      event: "server.start.failed",
      category: "error",
      errorName: err.name,
      errorMessage: err.message,
    });
    process.exit(1);
  }
}

startServer();
