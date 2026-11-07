const { describe, it, mock, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const { buildLokiPayload, sendToLoki } = require("./lokiTransport");

const MESSAGE = Symbol.for("message");

describe("Loki transport", () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    mock.restoreAll();
  });

  it("builds a Loki push payload with low-cardinality labels", () => {
    const payload = buildLokiPayload({
      level: "warn",
      category: "security",
      event: "auth.login.failure",
      [MESSAGE]: '{"event":"auth.login.failure","email":"ad***@test.com"}',
    });

    assert.equal(payload.streams.length, 1);
    assert.equal(payload.streams[0].stream.service, "hustlehub-api");
    assert.equal(payload.streams[0].stream.job, "api");
    assert.equal(payload.streams[0].stream.level, "warn");
    assert.equal(payload.streams[0].stream.category, "security");
    assert.equal(payload.streams[0].values[0][1].includes("auth.login.failure"), true);
    assert.equal(payload.streams[0].values[0][1].includes("ad***@test.com"), true);
  });

  it("skips the network when LOKI_URL is empty", async () => {
    let called = false;
    globalThis.fetch = async () => {
      called = true;
      return { ok: true, status: 204 };
    };

    const result = await sendToLoki({ url: "", info: { level: "info" } });
    assert.deepEqual(result, { skipped: true });
    assert.equal(called, false);
  });

  it("posts JSON and adds Grafana Cloud basic auth when credentials exist", async () => {
    const calls = [];
    globalThis.fetch = async (url, options) => {
      calls.push({ url, options });
      return { ok: true, status: 204 };
    };

    const result = await sendToLoki({
      url: "https://logs.example.grafana.net/loki/api/v1/push",
      username: "123456",
      password: "glc_token",
      info: {
        level: "info",
        category: "audit",
        [MESSAGE]: '{"event":"gig.created"}',
      },
    });

    assert.equal(result.ok, true);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, "https://logs.example.grafana.net/loki/api/v1/push");
    assert.equal(calls[0].options.method, "POST");
    assert.equal(calls[0].options.headers["Content-Type"], "application/json");
    assert.equal(
      calls[0].options.headers.Authorization,
      `Basic ${Buffer.from("123456:glc_token").toString("base64")}`
    );
    const body = JSON.parse(calls[0].options.body);
    assert.equal(body.streams[0].values[0][1], '{"event":"gig.created"}');
  });
});
