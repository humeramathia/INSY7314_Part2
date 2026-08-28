const express = require("express");
const { success } = require("./utils/response");
const { errorMiddleware } = require("./middleware/errorMiddleware");

const app = express();

app.use(express.json());

app.get("/api/health", (req, res) => {
  return success(res, 200, "OK");
});

app.use(errorMiddleware);

module.exports = app;
