const { fail } = require("../utils/response");

const VALID_ROLES = ["client", "freelancer", "admin"];

/**
 * Restricts a route to one required role.
 *
 * Example:
 * router.post(
 *   "/",
 *   requireAuth,
 *   requireRole("freelancer"),
 *   createGig
 * );
 */
function requireRole(requiredRole) {
  if (!VALID_ROLES.includes(requiredRole)) {
    throw new Error(`Invalid role configured: ${requiredRole}`);
  }

  return function roleMiddleware(req, res, next) {
    if (!req.user) {
      return fail(res, 401, "Authentication required.");
    }

    if (req.user.role !== requiredRole) {
      return fail(res, 403, "Forbidden. Insufficient permissions.");
    }

    return next();
  };
}

module.exports = {
  requireRole,
};