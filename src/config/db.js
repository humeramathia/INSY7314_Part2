const mongoose = require("mongoose");
const { MONGODB_URI } = require("./index");
const { logger } = require("../utils/logger");

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);

    // Only the host and database name are logged, never the full URI
    // (it can contain a username and password).
    logger.info({
      message: "MongoDB connected successfully.",
      event: "db.connected",
      category: "system",
      host: mongoose.connection.host,
      database: mongoose.connection.name,
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn({ message: "db.disconnected", event: "db.disconnected", category: "system" });
    });

    mongoose.connection.on("error", (err) => {
      logger.error({
        message: "db.error",
        event: "db.error",
        category: "error",
        errorName: err.name,
        errorMessage: err.message,
      });
    });
  } catch (err) {
    logger.error({
      message: "db.connect.failed",
      event: "db.connect.failed",
      category: "error",
      errorName: err.name,
      errorMessage: err.message,
    });
    throw err;
  }
}

module.exports = {
  connectDB,
};
