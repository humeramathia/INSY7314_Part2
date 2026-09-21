const express = require("express");
const { listMine } = require("../controllers/transactionController");
const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/requireRole");

const router = express.Router();

router.get("/mine", requireAuth, requireRole("freelancer"), listMine);

module.exports = router;
