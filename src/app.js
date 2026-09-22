const express = require("express");
const helmet = require("helmet");
const { success } = require("./utils/response");
const { errorMiddleware } = require("./middleware/errorMiddleware");
const { notFoundMiddleware } = require("./middleware/notFound");
const { sanitiseBody } = require("./middleware/sanitiseMiddleware");
const authRoutes = require("./routes/authRoutes");
const gigRoutes = require("./routes/gigRoutes");
const adminRoutes = require("./routes/adminRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

const app = express();

/**
 * Security headers.
 *
 * The API does not load browser scripts, styles, frames, or other external
 * resources, so the CSP is intentionally restrictive.
 */
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        baseUri: ["'none'"],
        formAction: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
  })
);

app.use(express.json());
app.use(sanitiseBody);

app.get("/api/health", (req, res) => {
  return success(res, 200, "OK");
});

app.use("/api/auth", authRoutes);
app.use("/api/gigs", gigRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/transactions", transactionRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;