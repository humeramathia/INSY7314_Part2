const { fail } = require("../utils/response");

function validateRegister(req, res, next) {
  const { name, email, password, role } = req.body || {};

  if (!String(name || "").trim() || !String(email || "").trim() || !password || !String(role || "").trim()) {
    return fail(res, 400, "Name, email, password and role are required");
  }

  return next();
}

module.exports = {
  validateRegister,
};
