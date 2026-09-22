const fs = require("fs/promises");
const path = require("path");
const { randomUUID } = require("crypto");

const DATA_PATH = path.join(__dirname, "..", "data", "transactions.json");

async function readTransactions() {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === "ENOENT") {
      await writeTransactions([]);
      return [];
    }
    throw err;
  }
}

async function writeTransactions(transactions) {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(transactions, null, 2), "utf8");
}

async function findByFreelancerId(freelancerId) {
  const transactions = await readTransactions();
  return transactions.filter((transaction) => transaction.freelancerId === freelancerId);
}

async function findByBookingId(bookingId) {
  const transactions = await readTransactions();
  return transactions.find((transaction) => transaction.bookingId === bookingId) || null;
}

async function createTransaction({ bookingId, gigId, clientId, freelancerId, amount }) {
  const transactions = await readTransactions();
  const transaction = {
    id: randomUUID(),
    bookingId,
    gigId,
    clientId,
    freelancerId,
    amount,
    type: "booking",
    createdAt: new Date().toISOString(),
  };

  transactions.push(transaction);
  await writeTransactions(transactions);
  return transaction;
}

module.exports = {
  findByFreelancerId,
  findByBookingId,
  createTransaction,
};
