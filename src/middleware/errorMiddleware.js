const { fail } = require("../utils/response");

function errorMiddleware(err, req, res, next) {
  return fail(res, 500, "Something went wrong");
}

module.exports = {
  errorMiddleware,
};
