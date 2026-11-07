const fs = require("fs");
const path = require("path");

const EVIDENCE_DIR = path.join(__dirname, "..", "docs", "evidence", "e2e");

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

function uniqueUser(role) {
  const stamp = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  return {
    name: role === "freelancer" ? "Playwright Freelancer" : "Playwright Client",
    email: `e2e.${role}.${stamp}@example.com`,
    password: "Secret123!",
    role,
  };
}

module.exports = {
  saveEvidence,
  uniqueUser,
};
