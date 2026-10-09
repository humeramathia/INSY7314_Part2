const { body, validationResult } = require("express-validator");
const { fail } = require("../utils/response");

const ALLOWED_GIG_FIELDS = ["title", "description", "category", "price"];

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

const validateGig = [
  rejectUnexpectedFields(ALLOWED_GIG_FIELDS),
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10, max: 2000 })
    .withMessage("Description must be between 10 and 2000 characters"),
  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Category must be between 2 and 50 characters"),
  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ gt: 0 })
    .withMessage("Price must be a number greater than 0")
    .toFloat(),
  handleValidationErrors,
];

module.exports = {
  validateGig,
};
