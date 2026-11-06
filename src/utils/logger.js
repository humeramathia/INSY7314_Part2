const fs = require("fs");
const path = require("path");
const winston = require("winston");

/**
 * Central application logger (Winston).
 *
 * Every log entry is one line of JSON with a timestamp, level, event name,
 * and context such as requestId, userId, and IP address. JSON lines are easy
 * to search (grep, jq) and can be shipped to a log platform later.
 *
 * Where logs go:
 * - Console (stdout): always, so `docker compose logs api` shows them.
 * - logs/app.log:      every entry at LOG_LEVEL and above.
 * - logs/security.log: only security events (logins, denied access,
 *                      rate limiting, rejected tokens, unsafe input).
 * - logs/error.log:    only errors.
 *
 * Safety rules applied to every entry:
 * - Passwords, tokens, secrets, and Authorization headers are replaced
 *   with "[REDACTED]".
 * - Email addresses are masked (li***@example.com).
 * - Line breaks and control characters are stripped from strings so an
 *   attacker cannot forge extra log lines (log injection).
 */

const LOG_LEVEL = process.env.LOG_LEVEL || "info";
const LOG_DIR = process.env.LOG_DIR || path.join(__dirname, "..", "..", "logs");
const IS_TEST = process.env.NODE_ENV === "test";

const SENSITIVE_KEYS = [
  "password",
  "newpassword",
  "confirmpassword",
  "token",
  "accesstoken",
  "refreshtoken",
  "authorization",
  "jwt",
  "secret",
  "jwt_secret",
  "cookie",
];

const MAX_DEPTH = 5;

function maskEmail(email) {
  if (typeof email !== "string" || !email.includes("@")) {
    return undefined;
  }

  const [local, domain] = email.trim().toLowerCase().split("@");
  const visible = local.slice(0, 2);
  return `${visible}***@${domain}`;
}

function cleanString(value) {
  // Remove CR, LF, and other control characters (log injection / forging).
  let cleaned = "";
  for (const char of value) {
    const code = char.charCodeAt(0);
    cleaned += code < 32 || code === 127 ? " " : char;
  }
  return cleaned.slice(0, 1000);
}

function scrub(value, depth = 0) {
  if (typeof value === "string") {
    return cleanString(value);
  }

  if (value instanceof Error) {
    return { name: value.name, message: cleanString(String(value.message)) };
  }

  if (Array.isArray(value)) {
    return depth >= MAX_DEPTH ? "[Truncated]" : value.map((item) => scrub(item, depth + 1));
  }

  if (value !== null && typeof value === "object") {
    if (depth >= MAX_DEPTH) {
      return "[Truncated]";
    }

    const clean = {};

    for (const [key, nested] of Object.entries(value)) {
      const lowerKey = key.toLowerCase();

      if (SENSITIVE_KEYS.includes(lowerKey)) {
        clean[key] = "[REDACTED]";
      } else if (lowerKey === "email") {
        clean[key] = maskEmail(nested);
      } else {
        clean[key] = scrub(nested, depth + 1);
      }
    }

    return clean;
  }

  return value;
}

/** Winston format that applies the safety rules to the whole entry. */
const redact = winston.format((info) => {
  for (const key of Object.keys(info)) {
    if (key === "level" || key === "timestamp") continue;

    const lowerKey = key.toLowerCase();

    if (SENSITIVE_KEYS.includes(lowerKey)) {
      info[key] = "[REDACTED]";
    } else if (lowerKey === "email") {
      info[key] = maskEmail(info[key]);
    } else if (key !== "stack") {
      info[key] = scrub(info[key]);
    }
  }

  return info;
});

/** Keeps only entries tagged as security events. */
const onlySecurity = winston.format((info) => (info.category === "security" ? info : false));

/** One JSON object per line, with the most useful fields first. */
const orderedJson = winston.format.printf((info) => {
  const { timestamp, level, event, message, category, ...rest } = info;
  return JSON.stringify({
    timestamp,
    level,
    event: event || message,
    category,
    ...(event && message !== event ? { message } : {}),
    ...rest,
  });
});

const baseFormat = winston.format.combine(
  winston.format.timestamp(),
  redact(),
  orderedJson
);

const transports = [
  new winston.transports.Console({
    silent: IS_TEST,
  }),
];

if (!IS_TEST) {
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });

    transports.push(
      new winston.transports.File({
        filename: path.join(LOG_DIR, "app.log"),
        maxsize: 5 * 1024 * 1024,
        maxFiles: 5,
      }),
      new winston.transports.File({
        filename: path.join(LOG_DIR, "security.log"),
        format: winston.format.combine(onlySecurity(), baseFormat),
        maxsize: 5 * 1024 * 1024,
        maxFiles: 5,
      }),
      new winston.transports.File({
        filename: path.join(LOG_DIR, "error.log"),
        level: "error",
        maxsize: 5 * 1024 * 1024,
        maxFiles: 5,
      })
    );
  } catch (err) {
    // If the folder cannot be created (for example a read-only container),
    // keep logging to the console rather than crashing the API.
    console.error(`Could not create log directory ${LOG_DIR}; logging to console only.`);
  }
}

const logger = winston.createLogger({
  level: LOG_LEVEL,
  defaultMeta: { service: "hustlehub-api" },
  format: baseFormat,
  transports,
});

/**
 * Who / where context for an HTTP request. Never includes the body,
 * headers, or token.
 */
function requestContext(req) {
  if (!req) return {};

  return {
    requestId: req.id,
    ip: req.ip,
    method: req.method,
    path: req.originalUrl ? req.originalUrl.split("?")[0] : undefined,
    userId: req.user ? req.user.id : undefined,
    role: req.user ? req.user.role : undefined,
  };
}

/**
 * Security event: authentication, access control, abuse, suspicious input.
 * Written to app.log and security.log.
 */
function logSecurity(event, req, details = {}, level = "warn") {
  logger.log({
    level,
    message: event,
    event,
    ...requestContext(req),
    ...details,
    // Set last so a detail field can never overwrite the category.
    category: "security",
  });
}

/**
 * Business audit event: gig changes, bookings, transactions.
 * Written to app.log.
 */
function logAudit(event, req, details = {}, level = "info") {
  logger.log({
    level,
    message: event,
    event,
    ...requestContext(req),
    ...details,
    category: "audit",
  });
}

module.exports = {
  logger,
  logSecurity,
  logAudit,
  requestContext,
  maskEmail,
  scrub,
};
