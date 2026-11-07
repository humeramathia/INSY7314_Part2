process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const { test, expect } = require("@playwright/test");
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "..", "docs", "evidence", "part3");
const API = process.env.VITE_API_URL || "https://localhost:3000";

test.describe.configure({ timeout: 120_000 });

async function api(pathname, { method = "GET", token, body } = {}) {
  const response = await fetch(`${API}${pathname}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: response.status, json: await response.json() };
}

function lockAccountInsideApi(email) {
  execFileSync(
    "docker",
    [
      "compose",
      "exec",
      "-T",
      "api",
      "node",
      "-e",
      `
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const email = ${JSON.stringify(email)};
(async () => {
  for (let i = 0; i < 5; i += 1) {
    const response = await fetch("https://127.0.0.1:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: "WrongPass1!" }),
    });
    const json = await response.json();
    console.log(response.status, json.message);
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
`,
    ],
    { cwd: path.join(__dirname, ".."), encoding: "utf8", stdio: "inherit" }
  );
}

test("capture Part 3 evidence screenshots", async ({ page }) => {
  fs.mkdirSync(OUT, { recursive: true });
  const stamp = Date.now();
  const password = "Secret123!";
  const freelancer = {
    name: "Ada Lovelace",
    email: `ada.tax.${stamp}@example.com`,
    password,
    role: "freelancer",
  };
  const client = {
    name: "Client Buyer",
    email: `client.tax.${stamp}@example.com`,
    password,
    role: "client",
  };
  const lockUser = {
    name: "Locked User",
    email: `lock.${stamp}@example.com`,
    password,
    role: "client",
  };

  expect((await api("/api/auth/register", { method: "POST", body: freelancer })).status).toBe(201);
  expect((await api("/api/auth/register", { method: "POST", body: client })).status).toBe(201);
  expect((await api("/api/auth/register", { method: "POST", body: lockUser })).status).toBe(201);

  const freelancerLogin = await api("/api/auth/login", {
    method: "POST",
    body: { email: freelancer.email, password },
  });
  const clientLogin = await api("/api/auth/login", {
    method: "POST",
    body: { email: client.email, password },
  });
  const freelancerToken = freelancerLogin.json.data.token;
  const clientToken = clientLogin.json.data.token;

  const gig = await api("/api/gigs", {
    method: "POST",
    token: freelancerToken,
    body: {
      title: "Cape Town web rebuild",
      description: "Full freelance website rebuild billed as confirmed HustleHub income.",
      category: "Web",
      price: 120000,
    },
  });
  expect(gig.status).toBe(201);

  const booking = await api("/api/bookings", {
    method: "POST",
    token: clientToken,
    body: { gigId: gig.json.data.id },
  });
  expect(booking.status).toBe(201);

  const confirmed = await api(`/api/bookings/${booking.json.data.id}/confirm`, {
    method: "POST",
    token: clientToken,
  });
  expect(confirmed.status).toBe(200);

  await page.goto("/login");
  await page.getByLabel("Email").fill(freelancer.email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.getByRole("link", { name: "Income" }).click();
  await expect(page.getByRole("heading", { name: "Income vs estimated tax" })).toBeVisible();
  await expect(page.locator(".hh-income-hero .hh-price").first()).toContainText("120000");
  await page.screenshot({ path: path.join(OUT, "tax-income-dashboard.png"), fullPage: true });

  const sessionToken = await page.evaluate(() => sessionStorage.getItem("hh_token"));
  await page.getByRole("button", { name: "Logout" }).click();
  await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
  await page.screenshot({ path: path.join(OUT, "logout-session-cleared.png"), fullPage: true });

  const denied = await api("/api/auth/me", { token: sessionToken });
  expect(denied.status).toBe(401);
  await page.setContent(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Denylist</title>
<style>body{font:16px/1.45 ui-monospace,Consolas,monospace;background:#0f172a;color:#e2e8f0;margin:0;padding:32px}
h1{font:700 22px/1.2 Segoe UI,sans-serif;color:#f8fafc} .ok{color:#86efac} pre{background:#020617;padding:20px;border-radius:12px}</style>
</head><body>
<h1>POST /api/auth/logout then GET /api/auth/me</h1>
<p class="ok">Status ${denied.status} — JWT denylist rejected the old token</p>
<pre>${JSON.stringify(denied.json, null, 2)}</pre>
</body></html>`);
  await page.screenshot({ path: path.join(OUT, "logout-denylist-me-401.png"), fullPage: true });

  lockAccountInsideApi(lockUser.email);

  await page.goto("/login");
  await page.getByLabel("Email").fill(lockUser.email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("alert")).toContainText("Account temporarily locked");
  await page.screenshot({ path: path.join(OUT, "account-lockout-423.png"), fullPage: true });
});
