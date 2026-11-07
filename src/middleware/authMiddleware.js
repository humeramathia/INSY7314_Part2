const { fail } = require("../utils/response");
const { verifyToken } = require("../utils/jwt");
const { isDenied } = require("../models/tokenDenylist");

/**
 * Requires a valid JWT before allowing access to a protected route.
 * On success, the decoded token is stored in req.user.
 */
async function requireAuth(req, res, next) {
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

    if (decoded.jti && (await isDenied(decoded.jti))) {
      return fail(res, 401, "Invalid or expired token.");
    }

    req.user = {
      id: decoded.id,
      role: decoded.role,
      jti: decoded.jti,
      exp: decoded.exp,
    };

    return next();
  } catch (err) {
    return fail(res, 401, "Invalid or expired token.");
  }
}

const authMiddleware = requireAuth;

module.exports = {
  requireAuth,
  authMiddleware,
};