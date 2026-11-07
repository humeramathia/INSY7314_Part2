const Transport = require("winston-transport");

const MESSAGE = Symbol.for("message");

function nanosecondTimestamp() {
  return `${Date.now()}000000`;
}

function logLine(info) {
  if (typeof info[MESSAGE] === "string" && info[MESSAGE]) {
    return info[MESSAGE];
  }

  return JSON.stringify({
    level: info.level,
    event: info.event || info.message,
    category: info.category,
  });
}

function buildLokiPayload(info, labels = {}) {
  return {
    streams: [
      {
        stream: {
          service: "hustlehub-api",
          job: "api",
          level: info.level || "info",
          category: info.category || "app",
          ...labels,
        },
        values: [[nanosecondTimestamp(), logLine(info)]],
      },
    ],
  };
}

function authHeaders(username, password) {
  const headers = { "Content-Type": "application/json" };

  if (username && password) {
    headers.Authorization = `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
  }

  return headers;
}

/**
 * POST one already-redacted log line to Grafana Loki (local Compose or
 * Grafana Cloud). Failures are swallowed so a log platform outage cannot
 * take the API down.
 */
async function sendToLoki({ url, username, password, info, labels }) {
  if (!url) {
    return { skipped: true };
  }

  const response = await globalThis.fetch(url, {
    method: "POST",
    headers: authHeaders(username, password),
    body: JSON.stringify(buildLokiPayload(info, labels)),
    signal: AbortSignal.timeout(4000),
  });

  return { ok: response.ok, status: response.status };
}

class LokiTransport extends Transport {
  constructor(options = {}) {
    super(options);
    this.url = options.url;
    this.username = options.username;
    this.password = options.password;
  }

  log(info, callback) {
    callback();
    sendToLoki({
      url: this.url,
      username: this.username,
      password: this.password,
      info,
    }).catch(() => {});
  }
}

module.exports = {
  LokiTransport,
  buildLokiPayload,
  sendToLoki,
};
