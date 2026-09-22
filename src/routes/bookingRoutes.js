const express = require("express");
const { create, listMine, confirm } = require("../controllers/bookingController");
const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const { bookingLimiter } = require("../middleware/rateLimitMiddleware");
const { validateBooking } = require("../middleware/validateBooking");

const router = express.Router();

router.post(
  "/",
  requireAuth,
  requireRole("client"),
  bookingLimiter,
  validateBooking,
  create
);

router.get("/mine", requireAuth, listMine);

router.post(
  "/:id/confirm",
  requireAuth,
  requireRole("client"),
  bookingLimiter,
  confirm
);

module.exports = router;