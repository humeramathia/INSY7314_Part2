const { success } = require("../utils/response");
const { findAll, findByFreelancerId, createGig } = require("../models/gigModel");

async function listGigs(req, res, next) {
  try {
    const gigs = await findAll();
    return success(res, 200, "Gigs retrieved successfully", gigs);
  } catch (err) {
    return next(err);
  }
}

async function listMyGigs(req, res, next) {
  try {
    const gigs = await findByFreelancerId(req.user.id);
    return success(res, 200, "Your gigs retrieved successfully", gigs);
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  try {
    const { title, description, category, price } = req.body;

    const gig = await createGig({
      title: String(title).trim(),
      description: String(description).trim(),
      category: String(category).trim(),
      price,
      freelancerId: req.user.id,
    });

    return success(res, 201, "Gig created successfully", gig);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listGigs,
  listMyGigs,
  create,
};
