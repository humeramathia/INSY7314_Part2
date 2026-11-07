const { success, fail } = require("../utils/response");
const { findById: findGigById } = require("../models/gigModel");
const {
  findById: findBookingById,
  findMine,
  createBooking,
  confirmBooking,
} = require("../models/bookingModel");
const { createTransaction, findByBookingId } = require("../models/transactionModel");
const { logAudit, logSecurity } = require("../utils/logger");

async function create(req, res, next) {
  try {
    const gig = await findGigById(req.body.gigId);

    if (!gig) {
      logAudit("booking.create.failed", req, { reason: "gig_not_found", gigId: req.body.gigId }, "warn");
      return fail(res, 404, "Gig not found");
    }

    const booking = await createBooking({
      gigId: gig.id,
      clientId: req.user.id,
      freelancerId: gig.freelancerId,
      amount: gig.price,
    });

    logAudit("booking.created", req, {
      bookingId: booking.id,
      gigId: booking.gigId,
      clientId: booking.clientId,
      freelancerId: booking.freelancerId,
      amount: booking.amount,
      status: booking.status,
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
      logAudit(
        "booking.confirm.failed",
        req,
        { reason: "booking_not_found", bookingId: req.params.id },
        "warn"
      );
      return fail(res, 404, "Booking not found");
    }

    if (booking.clientId !== req.user.id) {
      // A client tried to confirm (and trigger payment on) someone else's booking.
      logSecurity("access.denied", req, {
        reason: "not_booking_owner",
        bookingId: booking.id,
        ownerId: booking.clientId,
      });
      return fail(res, 403, "Forbidden");
    }

    if (booking.status === "confirmed") {
      logAudit(
        "booking.confirm.failed",
        req,
        { reason: "already_confirmed", bookingId: booking.id },
        "warn"
      );
      return fail(res, 409, "Booking already confirmed");
    }

    const existingTransaction = await findByBookingId(booking.id);

    if (existingTransaction) {
      // Booking still pending but a payment exists: possible double-payment attempt.
      logAudit(
        "transaction.duplicate_blocked",
        req,
        { bookingId: booking.id, existingTransactionId: existingTransaction.id },
        "warn"
      );
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

    logAudit("booking.confirmed", req, {
      bookingId: confirmed.id,
      gigId: confirmed.gigId,
      clientId: confirmed.clientId,
      freelancerId: confirmed.freelancerId,
    });

    logAudit("transaction.recorded", req, {
      transactionId: transaction.id,
      bookingId: transaction.bookingId,
      gigId: transaction.gigId,
      clientId: transaction.clientId,
      freelancerId: transaction.freelancerId,
      amount: transaction.amount,
      type: transaction.type,
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
