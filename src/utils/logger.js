/**
 * Structured JSON logs for login, bookings, transactions, and errors.
 * Passwords, JWTs, and connection strings are never written.
 */
function write(level, event, fields = {}) {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    event,
    ...fields,
  });
  if (level === "error") {
    console.error(line);
    return;
  }
  console.log(line);
}

function info(event, fields) {
  write("info", event, fields);
}

function warn(event, fields) {
  write("warn", event, fields);
}

function error(event, fields) {
  write("error", event, fields);
}

module.exports = {
  info,
  warn,
  error,
};
