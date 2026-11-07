const { rateLimit } = require("express-rate-limit");
const { logSecurity } = require("../utils/logger");

function jsonHandler(message, limiter) {
  return (req, res) => {
    logSecurity("rate_limit.exceeded", req, { limiter });
    return res.status(429).json({
      success: false,
      message,
    });
  };
}

/**
 * Failed logins only. Successful logins do not consume the budget, so a
 * normal user is not locked out after five good sessions.
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: jsonHandler("Too many authentication attempts. Please try again later.", "auth"),
});

/**
 * Separate from login so a brute-force login test cannot starve registration,
 * and so account-creation spam has its own ceiling.
 */
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: jsonHandler("Too many registration attempts. Please try again later.", "register"),
});

const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: jsonHandler("Too many booking requests. Please try again later.", "booking"),
});

module.exports = {
  loginLimiter,
  registerLimiter,
  bookingLimiter,
  authLimiter: loginLimiter,
};
