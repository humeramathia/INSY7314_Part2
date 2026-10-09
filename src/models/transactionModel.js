const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
    },
    gigId: {
      type: String,
      required: true,
    },
    clientId: {
      type: String,
      required: true,
    },
    freelancerId: {
      type: String,
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      required: true,
      default: "booking",
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model("Transaction", transactionSchema);

function toPublic(doc) {
  if (!doc) return null;
  const transaction = typeof doc.toObject === "function" ? doc.toObject() : doc;
  return {
    id: transaction._id.toString(),
    bookingId: transaction.bookingId,
    gigId: transaction.gigId,
    clientId: transaction.clientId,
    freelancerId: transaction.freelancerId,
    amount: transaction.amount,
    type: transaction.type,
    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt,
  };
}

async function findByFreelancerId(freelancerId) {
  const transactions = await Transaction.find({ freelancerId }).sort({ createdAt: -1 });
  return transactions.map(toPublic);
}

async function findByBookingId(bookingId) {
  return toPublic(await Transaction.findOne({ bookingId }));
}

async function createTransaction({ bookingId, gigId, clientId, freelancerId, amount }) {
  const transaction = await Transaction.create({
    bookingId,
    gigId,
    clientId,
    freelancerId,
    amount,
    type: "booking",
  });
  return toPublic(transaction);
}

module.exports = {
  Transaction,
  findByFreelancerId,
  findByBookingId,
  createTransaction,
};
