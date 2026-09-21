const express = require("express");
const { listGigs, listMyGigs, getGig, create, update, remove } = require("../controllers/gigController");
const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/requireRole");
const { requireGigOwner } = require("../middleware/requireGigOwner");
const { validateGig } = require("../middleware/validateGig");

const router = express.Router();

router.get("/", listGigs);
router.get("/mine", requireAuth, requireRole("freelancer"), listMyGigs);
router.get("/:id", getGig);
router.post("/", requireAuth, requireRole("freelancer"), validateGig, create);
router.put("/:id", requireAuth, requireRole("freelancer"), requireGigOwner, validateGig, update);
router.delete("/:id", requireAuth, requireRole("freelancer"), requireGigOwner, remove);

module.exports = router;
