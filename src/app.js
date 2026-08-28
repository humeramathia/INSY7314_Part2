const express = require("express");
const { success } = require("./utils/response");

const app = express();

app.use(express.json());

app.get("/api/health", (req, res) => {
  return success(res, 200, "OK");
});

module.exports = app;
