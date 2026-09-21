const { fail } = require("../utils/response");

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return fail(res, 401, "Access denied. No token provided.");
    }

    if (!allowedRoles.includes(req.user.role)) {
      return fail(res, 403, "Forbidden");
    }

    return next();
  };
}

module.exports = {
  requireRole,
};
