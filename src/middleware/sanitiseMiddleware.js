const { fail } = require("../utils/response");
const { logSecurity } = require("../utils/logger");

/**
 * Removes basic HTML/script content from strings.
 */
function sanitiseString(value) {
  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]*>/g, "")
    .trim();
}

/**
 * Recursively sanitises objects and arrays.
 *
 * MongoDB operator-style keys such as "$where" and keys containing "."
 * are rejected rather than passed to controllers.
 */
function sanitiseValue(value) {
  if (typeof value === "string") {
    return sanitiseString(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitiseValue(item));
  }

  if (value !== null && typeof value === "object") {
    const cleanObject = {};

    for (const [key, nestedValue] of Object.entries(value)) {
      if (key.startsWith("$") || key.includes(".")) {
        const error = new Error("Unsafe MongoDB operator detected.");
        error.statusCode = 400;
        throw error;
      }

      cleanObject[key] = sanitiseValue(nestedValue);
    }

    return cleanObject;
  }

  return value;
}

function sanitiseBody(req, res, next) {
  try {
    if (
      req.body &&
      typeof req.body === "object" &&
      !Buffer.isBuffer(req.body)
    ) {
      req.body = sanitiseValue(req.body);
    }

    return next();
  } catch (err) {
    // A "$" or "." key is a typical NoSQL injection payload ({"$ne": null}).
    // The payload itself is not logged.
    logSecurity("input.unsafe_rejected", req, { reason: "mongo_operator_key" });
    return fail(res, 400, "Invalid or unsafe request data.");
  }
}

module.exports = {
  sanitiseBody,
};