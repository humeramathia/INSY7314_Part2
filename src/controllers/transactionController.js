const { success } = require("../utils/response");
const { findByFreelancerId } = require("../models/transactionModel");

async function listMine(req, res, next) {
  try {
    const items = await findByFreelancerId(req.user.id);
    const totalIncome = items.reduce((sum, transaction) => sum + Number(transaction.amount), 0);

    return success(res, 200, "Income retrieved successfully", {
      items,
      totalIncome,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listMine,
};
