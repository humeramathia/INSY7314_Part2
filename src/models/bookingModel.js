const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    gigId: {
      type: String,
      required: true,
      index: true,
    },
    clientId: {
      type: String,
      required: true,
      index: true,
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
    status: {
      type: String,
      required: true,
      enum: ["pending", "confirmed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model("Booking", bookingSchema);

function toPublic(doc) {
  if (!doc) return null;
  const booking = typeof doc.toObject === "function" ? doc.toObject() : doc;
  return {
    id: booking._id.toString(),
    gigId: booking.gigId,
    clientId: booking.clientId,
    freelancerId: booking.freelancerId,
    amount: booking.amount,
    status: booking.status,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
  };
}

async function findById(id) {
  if (!mongoose.isValidObjectId(id)) {
    return null;
  }

  return toPublic(await Booking.findById(id));
}

async function findMine(userId, role) {
  const filter = role === "freelancer" ? { freelancerId: userId } : { clientId: userId };
  const bookings = await Booking.find(filter).sort({ createdAt: -1 });
  return bookings.map(toPublic);
}

async function createBooking({ gigId, clientId, freelancerId, amount }) {
  const booking = await Booking.create({
    gigId,
    clientId,
    freelancerId,
    amount,
    status: "pending",
  });
  return toPublic(booking);
}

async function confirmBooking(id) {
  if (!mongoose.isValidObjectId(id)) {
    return null;
  }

  const booking = await Booking.findByIdAndUpdate(
    id,
    { status: "confirmed" },
    { new: true }
  );

  return toPublic(booking);
}

module.exports = {
  Booking,
  findById,
  findMine,
  createBooking,
  confirmBooking,
};
