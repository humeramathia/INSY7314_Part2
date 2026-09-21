const express = require("express");
const { listGigs, listMyGigs, create } = require("../controllers/gigController");
const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/requireRole");
const { validateGig } = require("../middleware/validateGig");

const router = express.Router();

router.get("/", listGigs);
router.get("/mine", requireAuth, requireRole("freelancer"), listMyGigs);
router.post("/", requireAuth, requireRole("freelancer"), validateGig, create);

module.exports = router;
