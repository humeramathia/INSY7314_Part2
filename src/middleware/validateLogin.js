const { body, validationResult } = require("express-validator");
const { fail } = require("../utils/response");

const ALLOWED_LOGIN_FIELDS = ["email", "password"];

function rejectUnexpectedFields(allowedFields) {
  return (req, res, next) => {
    const receivedFields = Object.keys(req.body || {});
    const unexpectedFields = receivedFields.filter((field) => !allowedFields.includes(field));

    if (unexpectedFields.length > 0) {
      return fail(res, 400, `Unexpected field(s): ${unexpectedFields.join(", ")}`);
    }

    return next();
  };
}

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return fail(res, 400, errors.array()[0].msg);
  }

  return next();
}

const validateLogin = [
  rejectUnexpectedFields(ALLOWED_LOGIN_FIELDS),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("A valid email address is required")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];

module.exports = {
  validateLogin,
};
