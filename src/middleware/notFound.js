const { fail } = require("../utils/response");

function notFoundMiddleware(req, res) {
  return fail(res, 404, "Route not found");
}

module.exports = {
  notFoundMiddleware,
};
