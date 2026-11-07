const { fail } = require("../utils/response");
const { logger, requestContext } = require("../utils/logger");

function errorMiddleware(err, req, res, next) {
  // Invalid JSON sent by the client.
  if (err.type === "entity.parse.failed") {
    logger.warn({
      message: "request.invalid_json",
      event: "request.invalid_json",
      category: "error",
      ...requestContext(req),
    });
    return fail(res, 400, "Invalid JSON request body.");
  }

  // Unexpected errors: full detail (including stack) goes to the server log
  // with the request ID, so the failing request can be found again.
  logger.error({
    message: "error.unhandled",
    event: "error.unhandled",
    category: "error",
    ...requestContext(req),
    errorName: err.name,
    errorMessage: err.message,
    stack: err.stack,
  });

  // Never expose internal error details or stack traces to the client.
  return fail(res, 500, "Something went wrong");
}

module.exports = {
  errorMiddleware,
};
