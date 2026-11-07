const { fail } = require("../utils/response");
const { verifyToken } = require("../utils/jwt");
const { logSecurity } = require("../utils/logger");

/**
 * Requires a valid JWT before allowing access to a protected route.
 * On success, the decoded token is stored in req.user.
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    logSecurity("auth.token.missing", req);
    return fail(res, 401, "Access denied. No token provided.");
  }

  const token = header.slice(7).trim();

  if (!token) {
    logSecurity("auth.token.missing", req);
    return fail(res, 401, "Access denied. No token provided.");
  }

  try {
    const decoded = verifyToken(token);

    if (!decoded.id || !decoded.role) {
      logSecurity("auth.token.invalid", req, { reason: "missing_claims" });
      return fail(res, 401, "Invalid or expired token.");
    }

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    return next();
  } catch (err) {
    // err.name is TokenExpiredError or JsonWebTokenError; the token itself is never logged.
    logSecurity("auth.token.invalid", req, {
      reason: err.name === "TokenExpiredError" ? "expired" : "bad_signature_or_malformed",
    });
    return fail(res, 401, "Invalid or expired token.");
  }
}

const authMiddleware = requireAuth;

module.exports = {
  requireAuth,
  authMiddleware,
};