const { success, fail } = require("../utils/response");
const { findById: findGigById } = require("../models/gigModel");
const {
  findById: findBookingById,
  findMine,
  createBooking,
  confirmBooking,
} = require("../models/bookingModel");
const { createTransaction, findByBookingId } = require("../models/transactionModel");

async function create(req, res, next) {
  try {
    const gig = await findGigById(req.body.gigId);

    if (!gig) {
      return fail(res, 404, "Gig not found");
    }

    const booking = await createBooking({
      gigId: gig.id,
      clientId: req.user.id,
      freelancerId: gig.freelancerId,
      amount: gig.price,
    });

    return success(res, 201, "Booking created successfully", booking);
  } catch (err) {
    return next(err);
  }
}

async function listMine(req, res, next) {
  try {
    const bookings = await findMine(req.user.id, req.user.role);
    return success(res, 200, "Your bookings retrieved successfully", bookings);
  } catch (err) {
    return next(err);
  }
}

async function confirm(req, res, next) {
  try {
    const booking = await findBookingById(req.params.id);

    if (!booking) {
      return fail(res, 404, "Booking not found");
    }

    if (booking.clientId !== req.user.id) {
      return fail(res, 403, "Forbidden");
    }

    if (booking.status === "confirmed") {
      return fail(res, 409, "Booking already confirmed");
    }

    const existingTransaction = await findByBookingId(booking.id);

    if (existingTransaction) {
      return fail(res, 409, "Booking already confirmed");
    }

    const confirmed = await confirmBooking(booking.id);
    const transaction = await createTransaction({
      bookingId: confirmed.id,
      gigId: confirmed.gigId,
      clientId: confirmed.clientId,
      freelancerId: confirmed.freelancerId,
      amount: confirmed.amount,
    });

    return success(res, 200, "Booking confirmed successfully", {
      booking: confirmed,
      transaction,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  create,
  listMine,
  confirm,
};
