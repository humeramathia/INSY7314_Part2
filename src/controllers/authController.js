const { success, fail } = require("../utils/response");
const { hashPassword, comparePassword } = require("../utils/password");
const { signToken } = require("../utils/jwt");
const { createUser, findByEmail, findById, emailExists } = require("../models/userModel");

function toPublicUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;

    if (await emailExists(email)) {
      return fail(res, 409, "Email already registered");
    }

    const hashedPassword = await hashPassword(password);
    const user = await createUser({
      name: String(name).trim(),
      email,
      password: hashedPassword,
      role: String(role).trim().toLowerCase(),
    });

    return success(res, 201, "User registered successfully", toPublicUser(user));
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await findByEmail(email);

    if (!user) {
      return fail(res, 401, "Invalid email or password");
    }

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return fail(res, 401, "Invalid email or password");
    }

    const token = signToken({ id: user.id, role: user.role });

    return success(res, 200, "Login successful", {
      token,
      user: toPublicUser(user),
    });
  } catch (err) {
    return next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await findById(req.user.id);

    if (!user) {
      return fail(res, 401, "Invalid or expired token.");
    }

    return success(res, 200, "Authenticated user", toPublicUser(user));
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  register,
  login,
  me,
};
