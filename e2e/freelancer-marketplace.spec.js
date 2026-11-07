const { test, expect } = require("@playwright/test");
const { saveEvidence, uniqueUser } = require("./helpers");

test.describe.serial("freelancer marketplace", () => {
  let freelancer = uniqueUser("freelancer");
  let gigTitle = `E2E logo design ${Date.now()}`;

  test("rejects a wrong password without signing in", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
    await page.getByLabel("Email").fill("nobody@example.com");
    await page.getByLabel("Password").fill("WrongPass1!");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("alert")).toContainText("Invalid email or password");
    await saveEvidence(page, "01-login-rejected");
  });

  test("registers, publishes a gig, and opens the tax estimate", async ({ page }) => {
    freelancer = uniqueUser("freelancer");
    gigTitle = `E2E logo design ${Date.now()}`;
    await page.goto("/register");
    await expect(page.getByRole("heading", { name: "Create an account" })).toBeVisible();
    await page.getByLabel("Name").fill(freelancer.name);
    await page.getByLabel("Email").fill(freelancer.email);
    await page.getByLabel("Password").fill(freelancer.password);
    await page.getByLabel("Role").selectOption("freelancer");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByRole("heading", { name: "Browse gigs" })).toBeVisible();
    await expect(page.locator(".hh-userchip")).toContainText(freelancer.name);
    await saveEvidence(page, "02-registered-freelancer");

    await page.getByRole("link", { name: "New gig" }).click();
    await expect(page.getByRole("heading", { name: "New gig" })).toBeVisible();
    await page.getByLabel("Title").fill(gigTitle);
    await page.getByLabel("Description").fill("End to end Playwright listing for HustleHub plus.");
    await page.getByLabel("Category").fill("Design");
    await page.getByLabel("Price (R)").fill("450");
    await page.getByRole("button", { name: "Publish gig" }).click();

    await expect(page.getByRole("heading", { name: "My gigs" })).toBeVisible();
    await expect(page.getByRole("heading", { name: gigTitle })).toBeVisible();
    await saveEvidence(page, "03-gig-published");

    await page.getByRole("link", { name: "Income" }).click();
    await expect(page.getByRole("heading", { name: "Income" })).toBeVisible();
    await expect(page.getByText("Estimated tax")).toBeVisible();
    await expect(page.getByText(/SARS 2025\/26/).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "How the estimate is calculated" })).toBeVisible();
    await saveEvidence(page, "04-tax-estimate");
  });

  test("logs out and signs back in", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(freelancer.email);
    await page.getByLabel("Password").fill(freelancer.password);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.locator(".hh-userchip")).toContainText(freelancer.name);
    await saveEvidence(page, "05-signed-in");

    await page.getByRole("button", { name: "Logout" }).click();
    await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
    await saveEvidence(page, "06-logged-out");
  });
});
