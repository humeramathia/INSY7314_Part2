const { body, validationResult } = require("express-validator");
const { fail } = require("../utils/response");

const ALLOWED_REGISTER_FIELDS = ["name", "email", "password", "role"];

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

const validateRegister = [
  rejectUnexpectedFields(ALLOWED_REGISTER_FIELDS),
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .matches(/^[A-Za-zÀ-ÿ' -]+$/)
    .withMessage("Name may only contain letters, spaces, apostrophes, and hyphens"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isLength({ max: 254 })
    .withMessage("Email is too long")
    .isEmail()
    .withMessage("A valid email address is required")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must be between 8 and 128 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[^A-Za-z0-9]/)
    .withMessage("Password must contain at least one special character"),
  body("role")
    .trim()
    .notEmpty()
    .withMessage("Role is required")
    .isIn(["client", "freelancer", "admin"])
    .withMessage("Role must be client, freelancer or admin"),
  handleValidationErrors,
];

module.exports = {
  validateRegister,
};
