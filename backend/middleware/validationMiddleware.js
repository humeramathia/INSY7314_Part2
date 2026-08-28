const { body, validationResult } = require("express-validator");

// Only fields explicitly expected by the API are allowed
const rejectUnexpectedFields = (allowedFields) => {
    return (req, res, next) => {
        const receivedFields = Object.keys(req.body);

        const unexpectedFields = receivedFields.filter(
            (field) => !allowedFields.includes(field)
        );

        if (unexpectedFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Unexpected field(s): ${unexpectedFields.join(", ")}`
            });
        }

        next();
    };
};


// Handles all validation errors consistently
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errors.array().map((error) => ({
                field: error.path,
                message: error.msg
            }))
        });
    }

    next();
};


// Registration validation
const validateRegister = [
    rejectUnexpectedFields([
        "name",
        "email",
        "password",
        "role"
    ]),

    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required")
        .isLength({ min: 2, max: 50 })
        .withMessage("Name must be between 2 and 50 characters")
        .matches(/^[A-Za-zÀ-ÿ' -]+$/)
        .withMessage(
            "Name may only contain letters, spaces, apostrophes, and hyphens"
        ),

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
        .withMessage(
            "Password must be between 8 and 128 characters"
        )
        .matches(/[A-Z]/)
        .withMessage(
            "Password must contain at least one uppercase letter"
        )
        .matches(/[a-z]/)
        .withMessage(
            "Password must contain at least one lowercase letter"
        )
        .matches(/[0-9]/)
        .withMessage(
            "Password must contain at least one number"
        )
        .matches(/[^A-Za-z0-9]/)
        .withMessage(
            "Password must contain at least one special character"
        ),

    body("role")
        .trim()
        .notEmpty()
        .withMessage("Role is required")
        .isIn([
            "client",
            "freelancer",
            "admin"
        ])
        .withMessage(
            "Role must be client, freelancer, or admin"
        ),

    handleValidationErrors
];


// Login validation
const validateLogin = [
    rejectUnexpectedFields([
        "email",
        "password"
    ]),

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("A valid email address is required")
        .normalizeEmail(),

    body("password")
        .notEmpty()
        .withMessage("Password is required"),

    handleValidationErrors
];


module.exports = {
    validateRegister,
    validateLogin
};