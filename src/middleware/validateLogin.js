const { fail } = require("../utils/response");

function validateLogin(req, res, next) {
  const { email, password } = req.body || {};

  if (!String(email || "").trim() || !password) {
    return fail(res, 400, "Email and password are required");
  }

  return next();
}

module.exports = {
  validateLogin,
};
