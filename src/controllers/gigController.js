const { success, fail } = require("../utils/response");
const {
  findAll,
  findById,
  findByFreelancerId,
  createGig,
  updateGig,
  deleteGig,
} = require("../models/gigModel");

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

async function getGig(req, res, next) {
  try {
    const gig = await findById(req.params.id);

    if (!gig) {
      return fail(res, 404, "Gig not found");
    }

    return success(res, 200, "Gig retrieved successfully", gig);
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

async function update(req, res, next) {
  try {
    const { title, description, category, price } = req.body;

    const gig = await updateGig(req.params.id, {
      title: String(title).trim(),
      description: String(description).trim(),
      category: String(category).trim(),
      price,
    });

    if (!gig) {
      return fail(res, 404, "Gig not found");
    }

    return success(res, 200, "Gig updated successfully", gig);
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const deleted = await deleteGig(req.params.id);

    if (!deleted) {
      return fail(res, 404, "Gig not found");
    }

    return success(res, 200, "Gig deleted successfully");
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listGigs,
  listMyGigs,
  getGig,
  create,
  update,
  remove,
};
