const mongoose = require("mongoose");
const { MONGODB_URI } = require("./index");

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);

    console.log("MongoDB connected successfully.");
  } catch (err) {
    console.error("MongoDB connection failed.");
    throw err;
  }
}

module.exports = {
  connectDB,
};