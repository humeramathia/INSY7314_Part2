const express = require("express");
const { success } = require("./utils/response");
const { errorMiddleware } = require("./middleware/errorMiddleware");
const { notFoundMiddleware } = require("./middleware/notFound");
const { sanitiseBody } = require("./middleware/sanitiseMiddleware");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(express.json());
app.use(sanitiseBody);

app.get("/api/health", (req, res) => {
  return success(res, 200, "OK");
});

app.use("/api/auth", authRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;