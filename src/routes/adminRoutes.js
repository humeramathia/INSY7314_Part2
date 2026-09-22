const express = require("express");
const { listGigs } = require("../controllers/gigController");
const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/gigs", requireAuth, requireRole("admin"), listGigs);

module.exports = router;