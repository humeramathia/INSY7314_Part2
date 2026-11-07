const { success, fail } = require("../utils/response");
const { hashPassword, comparePassword } = require("../utils/password");
const { signToken } = require("../utils/jwt");
const {
  createUser,
  findByEmail,
  findById,
  emailExists,
  isLocked,
  recordFailedLogin,
  clearFailedLogins,
} = require("../models/userModel");
const { denyToken } = require("../models/tokenDenylist");
const { logSecurity } = require("../utils/logger");

function toPublicUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;

    const publicRole = String(role).trim().toLowerCase();

    if (publicRole !== "client" && publicRole !== "freelancer") {
      logSecurity("auth.register.rejected", req, {
        reason: "invalid_role",
        requestedRole: publicRole,
        email,
      });
      return fail(res, 400, "Role must be client or freelancer");
    }

    if (await emailExists(email)) {
      logSecurity("auth.register.rejected", req, { reason: "duplicate_email", email });
      return fail(res, 409, "Email already registered");
    }

    const hashedPassword = await hashPassword(password);
    const user = await createUser({
      name: String(name).trim(),
      email,
      password: hashedPassword,
      role: publicRole,
    });

    logSecurity(
      "auth.register.success",
      req,
      { newUserId: user._id.toString(), newUserRole: user.role, email },
      "info"
    );

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
      logSecurity("auth.login.failure", req, { reason: "unknown_email", email });
      return fail(res, 401, "Invalid email or password");
    }

    if (isLocked(user)) {
      logSecurity("auth.login.locked", req, { userId: user._id.toString(), email });
      return fail(res, 423, "Account temporarily locked. Try again later.");
    }

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      const lockedNow = await recordFailedLogin(user);
      logSecurity("auth.login.failure", req, {
        reason: "wrong_password",
        email,
        targetUserId: user._id.toString(),
        locked: Boolean(lockedNow),
      });
      if (lockedNow) {
        return fail(res, 423, "Account temporarily locked. Try again later.");
      }
      return fail(res, 401, "Invalid email or password");
    }

    await clearFailedLogins(user);

    const token = signToken({
      id: user._id.toString(),
      role: user.role,
    });

    logSecurity(
      "auth.login.success",
      req,
      { userId: user._id.toString(), role: user.role, email },
      "info"
    );

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

async function logout(req, res, next) {
  try {
    if (req.user?.jti) {
      const decoded = req.user;
      const expiresAt = decoded.exp
        ? new Date(decoded.exp * 1000)
        : new Date(Date.now() + 60 * 60 * 1000);
      await denyToken(decoded.jti, expiresAt);
    }
    logSecurity(
      "auth.logout.success",
      req,
      { userId: req.user?.id, role: req.user?.role },
      "info"
    );
    return success(res, 200, "Logged out successfully");
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  register,
  login,
  me,
  logout,
};
