const { fail } = require("../utils/response");
const { verifyToken } = require("../utils/jwt");

function authMiddleware(req, res, next) {
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
    req.user = decoded;
    return next();
  } catch (err) {
    return fail(res, 401, "Invalid or expired token.");
  }
}

const requireAuth = authMiddleware;

module.exports = {
  authMiddleware,
  requireAuth,
};
