const { success } = require("../utils/response");
const { findAll } = require("../models/gigModel");

async function listGigs(req, res, next) {
  try {
    const gigs = await findAll();
    return success(res, 200, "Gigs retrieved successfully", gigs);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listGigs,
};
