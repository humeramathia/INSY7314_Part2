const { rateLimit } = require("express-rate-limit");
const { logSecurity } = require("../utils/logger");

/**
 * Limits repeated authentication attempts.
 * Applied to registration and login routes.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,

  handler: (req, res) => {
    // Repeated hits here usually mean password guessing or credential stuffing.
    logSecurity("rate_limit.exceeded", req, { limiter: "auth" });
    return res.status(429).json({
      success: false,
      message: "Too many authentication attempts. Please try again later.",
    });
  },
});

/**
 * Limits repeated booking actions.
 *
 * Humera will mount this on booking creation and confirmation routes
 * once those routes are available.
 */
const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,

  handler: (req, res) => {
    logSecurity("rate_limit.exceeded", req, { limiter: "booking" });
    return res.status(429).json({
      success: false,
      message: "Too many booking requests. Please try again later.",
    });
  },
});

module.exports = {
  authLimiter,
  bookingLimiter,
};