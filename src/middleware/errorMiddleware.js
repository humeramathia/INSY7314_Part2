const { fail } = require("../utils/response");
const { logger, requestContext } = require("../utils/logger");

function errorMiddleware(err, req, res, next) {
  if (err.type === "entity.parse.failed") {
    logger.warn({
      message: "request.invalid_json",
      event: "request.invalid_json",
      category: "error",
      ...requestContext(req),
    });
    return fail(res, 400, "Invalid JSON request body.");
  }

  if (err.type === "entity.too.large" || err.status === 413) {
    logger.warn({
      message: "request.too_large",
      event: "request.too_large",
      category: "error",
      ...requestContext(req),
    });
    return fail(res, 413, "Request body too large.");
  }

  logger.error({
    message: "error.unhandled",
    event: "error.unhandled",
    category: "error",
    ...requestContext(req),
    errorName: err.name,
    errorMessage: err.message,
    stack: err.stack,
  });

  return fail(res, 500, "Something went wrong");
}

module.exports = {
  errorMiddleware,
};
