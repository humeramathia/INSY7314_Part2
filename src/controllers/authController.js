const { success } = require("../utils/response");
const { hashPassword } = require("../utils/password");
const { createUser } = require("../models/userModel");

function toPublicUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    const hashedPassword = await hashPassword(password);
    const user = await createUser({
      name: String(name).trim(),
      email,
      password: hashedPassword,
      role: String(role).trim(),
    });

    return success(res, 201, "User registered successfully", toPublicUser(user));
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  register,
};
