const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const GRAFANA_URL = process.env.GRAFANA_URL || "http://localhost:3001";
const LOKI_QUERY_URL = process.env.LOKI_QUERY_URL || "http://localhost:3100";
const EVIDENCE_DIR = path.join(__dirname, "..", "docs", "evidence", "grafana");

async function saveEvidence(page, name) {
  if (process.env.E2E_SAVE_EVIDENCE !== "1") {
    return;
  }
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  await page.screenshot({
    path: path.join(EVIDENCE_DIR, `${name}.png`),
    fullPage: true,
  });
}

test("Grafana serves the provisioned HustleHub dashboard", async ({ page, request }) => {
  const health = await request.get(`${GRAFANA_URL}/api/health`);
  expect(health.ok()).toBeTruthy();

  const dashboard = await request.get(`${GRAFANA_URL}/api/dashboards/uid/hustlehub-logs`, {
    headers: {
      Authorization: `Basic ${Buffer.from("admin:admin").toString("base64")}`,
    },
  });
  expect(dashboard.ok()).toBeTruthy();
  const body = await dashboard.json();
  expect(body.dashboard.title).toMatch(/HustleHub\+ security and audit logs/);

  await expect
    .poll(
      async () => {
        const endNs = `${Date.now()}000000`;
        const startNs = `${Date.now() - 15 * 60 * 1000}000000`;
        const query = encodeURIComponent('{service="hustlehub-api"}');
        const loki = await request.get(
          `${LOKI_QUERY_URL}/loki/api/v1/query_range?query=${query}&start=${startNs}&end=${endNs}&limit=20`
        );
        if (!loki.ok()) return 0;
        const payload = await loki.json();
        return Array.isArray(payload.data?.result) ? payload.data.result.length : 0;
      },
      { timeout: 60_000 }
    )
    .toBeGreaterThan(0);

  await page.goto(`${GRAFANA_URL}/d/hustlehub-logs/hustlehub-security-and-audit-logs?orgId=1&refresh=10s`);
  await expect(page.getByText("HustleHub+ security and audit logs").first()).toBeVisible();
  await expect(page.getByText("Live API logs (passwords already redacted)")).toBeVisible();
  await saveEvidence(page, "grafana-hustlehub-dashboard");
});
