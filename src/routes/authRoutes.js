const express = require("express");
const { register, login, me } = require("../controllers/authController");
const { validateRegister } = require("../middleware/validateRegister");
const { validateLogin } = require("../middleware/validateLogin");
const { authMiddleware } = require("../middleware/authMiddleware");
const { loginLimiter, registerLimiter } = require("../middleware/rateLimitMiddleware");

const router = express.Router();

router.post("/register", registerLimiter, validateRegister, register);
router.post("/login", loginLimiter, validateLogin, login);
router.get("/me", authMiddleware, me);

module.exports = router;