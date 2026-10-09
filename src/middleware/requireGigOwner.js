const { fail } = require("../utils/response");
const { findById } = require("../models/gigModel");

async function requireGigOwner(req, res, next) {
  try {
    const gig = await findById(req.params.id);

    if (!gig) {
      return fail(res, 404, "Gig not found");
    }

    if (gig.freelancerId !== req.user.id) {
      return fail(res, 403, "Forbidden");
    }

    req.gig = gig;
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  requireGigOwner,
};
