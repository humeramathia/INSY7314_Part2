const express = require("express");
const { success } = require("./utils/response");
const { errorMiddleware } = require("./middleware/errorMiddleware");
const { notFoundMiddleware } = require("./middleware/notFound");
const authRoutes = require("./routes/authRoutes");
const gigRoutes = require("./routes/gigRoutes");

const app = express();

app.use(express.json());

app.get("/api/health", (req, res) => {
  return success(res, 200, "OK");
});

app.use("/api/auth", authRoutes);
app.use("/api/gigs", gigRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
