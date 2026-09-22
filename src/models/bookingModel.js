const fs = require("fs/promises");
const path = require("path");
const { randomUUID } = require("crypto");

const DATA_PATH = path.join(__dirname, "..", "data", "bookings.json");

async function readBookings() {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === "ENOENT") {
      await writeBookings([]);
      return [];
    }
    throw err;
  }
}

async function writeBookings(bookings) {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(bookings, null, 2), "utf8");
}

async function findById(id) {
  const bookings = await readBookings();
  return bookings.find((booking) => booking.id === id) || null;
}

async function findMine(userId, role) {
  const bookings = await readBookings();

  if (role === "freelancer") {
    return bookings.filter((booking) => booking.freelancerId === userId);
  }

  return bookings.filter((booking) => booking.clientId === userId);
}

async function createBooking({ gigId, clientId, freelancerId, amount }) {
  const bookings = await readBookings();
  const now = new Date().toISOString();
  const booking = {
    id: randomUUID(),
    gigId,
    clientId,
    freelancerId,
    amount,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  bookings.push(booking);
  await writeBookings(bookings);
  return booking;
}

async function confirmBooking(id) {
  const bookings = await readBookings();
  const index = bookings.findIndex((booking) => booking.id === id);

  if (index === -1) {
    return null;
  }

  bookings[index] = {
    ...bookings[index],
    status: "confirmed",
    updatedAt: new Date().toISOString(),
  };

  await writeBookings(bookings);
  return bookings[index];
}

module.exports = {
  findById,
  findMine,
  createBooking,
  confirmBooking,
};
