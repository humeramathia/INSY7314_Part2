const { fail } = require("../utils/response");
const { verifyToken } = require("../utils/jwt");

/**
 * Requires a valid JWT before allowing access to a protected route.
 * On success, the decoded token is stored in req.user.
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return fail(res, 401, "Access denied. No token provided.");
  }

  const token = header.slice(7).trim();

  if (!token) {
    return fail(res, 401, "Access denied. No token provided.");
  }

  try {
    const decoded = verifyToken(token);

    if (!decoded.id || !decoded.role) {
      return fail(res, 401, "Invalid or expired token.");
    }

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    return next();
  } catch (err) {
    return fail(res, 401, "Invalid or expired token.");
  }
}

/**
 * Backwards-compatible alias for Part 1 routes.
 */
const authMiddleware = requireAuth;

module.exports = {
  requireAuth,
  authMiddleware,
};