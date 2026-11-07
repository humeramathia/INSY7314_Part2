const crypto = require("crypto");
const { logger, requestContext } = require("../utils/logger");

/**
 * Gives every request a unique ID and returns it in the X-Request-Id
 * response header. Every log line for that request carries the same ID,
 * so one user action can be traced from the access log to the security
 * or error log.
 */
function requestId(req, res, next) {
  req.id = crypto.randomUUID();
  res.set("X-Request-Id", req.id);
  next();
}

/**
 * Access log: one line per request once the response is sent.
 *
 * Logged: method, path (no query string), status, duration, IP, user ID.
 * Not logged: request body, headers, or tokens.
 */
function accessLogger(req, res, next) {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    const status = res.statusCode;

    let level = "info";
    if (status >= 500) level = "error";
    else if (status >= 400) level = "warn";

    logger.log({
      level,
      message: "http.request",
      event: "http.request",
      category: "access",
      ...requestContext(req),
      status,
      durationMs: Math.round(durationMs * 10) / 10,
      userAgent: req.get("user-agent"),
    });
  });

  next();
}

module.exports = {
  requestId,
  accessLogger,
};
