function bookingLimiter(req, res, next) {
  return next();
}

module.exports = {
  bookingLimiter,
};
