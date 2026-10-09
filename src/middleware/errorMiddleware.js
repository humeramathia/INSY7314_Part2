const { fail } = require("../utils/response");

function errorMiddleware(err, req, res, next) {
  // Invalid JSON sent by the client.
  if (err.type === "entity.parse.failed") {
    return fail(res, 400, "Invalid JSON request body.");
  }

  // Log unexpected errors on the server only.
  console.error("Unhandled application error:", err);

  // Never expose internal error details or stack traces to the client.
  return fail(res, 500, "Something went wrong");
}

module.exports = {
  errorMiddleware,
};