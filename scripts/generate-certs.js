const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const certsDir = path.join(__dirname, "..", "certs");
const keyPath = path.join(certsDir, "key.pem");
const certPath = path.join(certsDir, "cert.pem");

function findOpenSsl() {
  const fromPath = spawnSync("openssl", ["version"], { encoding: "utf8" });
  if (fromPath.status === 0) {
    return "openssl";
  }

  const gitOpenSsl = path.join("C:", "Program Files", "Git", "usr", "bin", "openssl.exe");
  if (fs.existsSync(gitOpenSsl)) {
    return gitOpenSsl;
  }

  return null;
}

function generate() {
  fs.mkdirSync(certsDir, { recursive: true });

  const openssl = findOpenSsl();
  if (!openssl) {
    console.error("OpenSSL was not found. Install Git for Windows or add openssl to PATH.");
    process.exit(1);
  }

  const result = spawnSync(
    openssl,
    [
      "req",
      "-x509",
      "-newkey",
      "rsa:2048",
      "-sha256",
      "-days",
      "365",
      "-nodes",
      "-keyout",
      keyPath,
      "-out",
      certPath,
      "-subj",
      "/CN=localhost",
      "-addext",
      "subjectAltName=DNS:localhost,IP:127.0.0.1",
    ],
    { encoding: "utf8" }
  );

  if (result.status !== 0) {
    console.error(result.stderr || result.stdout || "Failed to generate certificates.");
    process.exit(1);
  }

  console.log("Created certs/key.pem and certs/cert.pem (gitignored).");
  console.log("Start the API with npm run dev and use https://localhost:3000");
}

generate();
