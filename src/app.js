const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { success } = require("./utils/response");
const { errorMiddleware } = require("./middleware/errorMiddleware");
const { notFoundMiddleware } = require("./middleware/notFound");
const { sanitiseBody } = require("./middleware/sanitiseMiddleware");
const { requestId, accessLogger } = require("./middleware/requestLogger");
const authRoutes = require("./routes/authRoutes");
const gigRoutes = require("./routes/gigRoutes");
const adminRoutes = require("./routes/adminRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

const app = express();

// Behind Docker / a reverse proxy, trust one hop so req.ip is the real
// client address in logs and rate limiting.
if (process.env.TRUST_PROXY === "true") {
  app.set("trust proxy", 1);
}

// Request ID and access logging run first so every request is logged,
// including ones rejected by later middleware.
app.use(requestId);
app.use(accessLogger);

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
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["X-Request-Id"],
  })
);

app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

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