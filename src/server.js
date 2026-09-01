require("dotenv").config();

const fs = require("fs");
const http = require("http");
const https = require("https");
const path = require("path");

const app = require("./app");
const { PORT } = require("./config");

const keyPath = path.join(__dirname, "..", "certs", "key.pem");
const certPath = path.join(__dirname, "..", "certs", "cert.pem");
const hasCerts = fs.existsSync(keyPath) && fs.existsSync(certPath);

if (hasCerts) {
  const options = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };

  https.createServer(options, app).listen(PORT, () => {
    console.log(`HustleHub+ API listening on https://localhost:${PORT}`);
  });
} else {
  http.createServer(app).listen(PORT, () => {
    console.log(`HustleHub+ API listening on http://localhost:${PORT}`);
    console.log("HTTPS certs not found in /certs. Generate them with mkcert to enable HTTPS.");
  });
}
