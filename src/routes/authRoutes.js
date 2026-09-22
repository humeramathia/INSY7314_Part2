const express = require("express");
const { register, login, me } = require("../controllers/authController");
const { validateRegister } = require("../middleware/validateRegister");
const { validateLogin } = require("../middleware/validateLogin");
const { authMiddleware } = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/rateLimitMiddleware");

const router = express.Router();

router.post("/register", authLimiter, validateRegister, register);
router.post("/login", authLimiter, validateLogin, login);
router.get("/me", authMiddleware, me);

module.exports = router;