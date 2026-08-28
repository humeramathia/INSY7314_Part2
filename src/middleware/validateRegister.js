const { fail } = require("../utils/response");

const ALLOWED_ROLES = ["client", "freelancer", "admin"];

function validateRegister(req, res, next) {
  const { name, email, password, role } = req.body || {};

  if (
    !String(name || "").trim() ||
    !String(email || "").trim() ||
    !String(password || "").trim() ||
    !String(role || "").trim()
  ) {
    return fail(res, 400, "Name, email, password and role are required");
  }

  if (!ALLOWED_ROLES.includes(String(role).trim().toLowerCase())) {
    return fail(res, 400, "Role must be client, freelancer or admin");
  }

  return next();
}

module.exports = {
  validateRegister,
};
