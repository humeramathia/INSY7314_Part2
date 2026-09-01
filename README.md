# HustleHub+ — Architecture, HTTPS & Security Documentation

## 1. System overview and intended users

HustleHub+ is a safe freelancing platform where Freelancers can post their gigs and Clients look for and book them. The platform also tracks the monetary transactions that arise from booking activities. It provides Freelancers with a dashboard showing their earnings and tax liability estimates. Since the system must manage credentials, transactions, and income, security is considered essential.

For Part 1, it is deliberate that the scope is narrowed to the basics of the project by providing an API through which a user can sign up and log in. The database is not created; users will be stored in an in-memory/file storage, but the security is implemented as if the database existed from the start.

## 2. Architecture
![Architecture diagram](./Architecture%20Diagram%20.png)

The diagram below shows the three layers of the MERN architecture along with the security perimeter for each layer:

- **Client tier (React SPA)** — the client-facing UI that never communicates with the server except over HTTPS, and never stores plain passwords or secrets; only the JWT issued on successful authentication is stored.
- **Server tier (Node.js + Express)** — the only tier accessible from the client-side code, and only over HTTPS. Within this perimeter, any request is always filtered through three layers of processing before reaching business logic:
  1. **Auth & JWT** — authenticates whether the user's identity is true (on login), or who they are according to the token (on secure routes).
  2. **Validation & sanitisation** — validates that the body of the request is formed correctly and gets rid of anything malicious before it reaches the controller.
  3. **Routes & controllers** — the registration, login, and booking process itself.
- **Data tier** — currently an in-memory/file store for Part 1; this will be converted to use MongoDB without altering the security layer above it, because the hashing, validation, and authentication all occur before data reaches storage.

Separating these into distinct stages, rather than having a single large handler, is itself a security choice: it means validation can't be overlooked for a given route, and the attack surface is kept small enough to test each stage individually.

## 3. Security decisions

### 3.1 Password hashing

Password hashes are generated using **bcryptjs with 12 salt rounds** before being saved, and the plaintext password is never stored anywhere. During login, the submitted password is never compared directly — instead, `bcrypt.compare()` checks it against the stored hash.

**Why:** should the user store ever be accessed in some way (a leaked backup, poorly configured logging, a vulnerable third-party dependency), the hash alone is difficult to reverse, particularly given bcrypt's built-in salting, which makes rainbow-table attacks irrelevant. Twelve salt rounds strikes a balance between making brute-force attempts unfeasible and only slightly slowing down registration and login. Plaintext storage, or a fast general-purpose hash such as MD5 or SHA-1, would mean a single data breach results in account takeover for every user.

### 3.2 Token-based authentication (JWT)

On successful login, the server returns a **JSON Web Token** containing the user's id and role, signed with a secret loaded from the `.env` file rather than hard-coded into the application. This token is then sent in the `Authorization: Bearer <token>` header on all subsequent requests.

**Why:** JWTs let the API stay stateless — the server doesn't need to keep a session store to know who's calling, which keeps the architecture simpler and easier to scale. Signing (not just encoding) the token means the client cannot forge or tamper with the id/role inside it: any modification invalidates the signature. Keeping the payload minimal (id, role — no password, no full profile) limits what's exposed if a token is ever intercepted. Loading the signing secret from `.env` (and keeping `.env` out of version control) means the secret can differ per environment and can never leak through the repository itself — a hard-coded secret would be compromised the moment the code is pushed anywhere public.

### 3.3 Input validation and sanitisation

Registration and login data is validated before it is passed to a controller: all required fields must be present, emails must be well-formatted, and passwords must meet a minimum strength. The registration step applies extra conditions on top of this, including role restriction and rejection of unexpected fields.

**Why:** the API is the first point of defence against injection, malformed-data, and privilege-escalation attacks. Validating at the boundary — before business logic executes — ensures one unified set of rules covers every route, instead of relying on each controller to validate its own input. Restricting roles explicitly closes off a common attack vector: without it, a user could submit `"role": "admin"` during registration and gain elevated permissions.

### 3.4 HTTPS

Even during local development, the API is served over HTTPS using a locally signed SSL certificate rather than plain HTTP.

**Why:** HTTPS encrypts communication between the client and server, which matters most at the two points where HTTP would be vulnerable — the login request (containing a password) and every request after that (containing the JWT). Without HTTPS, both would be visible to anyone on the same network, making the hashing and signing pointless. It also surfaces certificate or configuration problems early, rather than discovering them for the first time in production.

### 3.5 Controlled error handling

All errors are caught centrally and returned in a consistent JSON shape (a message and a status code). API error responses never disclose stack traces, file paths, secrets, or configuration information.

**Why:** verbose error messages can lead to accidental information leakage — revealing the framework version, internal file structure, environment variable names, or even fragments of source code. A controlled, consistent error shape gives the client (and the person debugging) enough information to act on without exposing anything about the server's internals.

## 4. HTTPS — local setup

This repository uses a self-signed certificate to serve its API over HTTPS locally (via `mkcert`), so the browser/Postman won't show any SSL warning.

```bash
# 1. Install mkcert (one-off, per machine)
# macOS
brew install mkcert
# Windows (with Chocolatey)
choco install mkcert
# Linux
sudo apt install libnss3-tools && \
  curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64" && \
  chmod +x mkcert-v*-linux-amd64 && sudo mv mkcert-v*-linux-amd64 /usr/local/bin/mkcert

# 2. Install the local CA into your system/browser trust store
mkcert -install

# 3. Generate a cert + key for localhost, saved into a /certs folder
mkdir certs
mkcert -key-file certs/key.pem -cert-file certs/cert.pem localhost 127.0.0.1
```

In `server.js` (or your entry file), load the certificate and start an HTTPS server instead of a plain HTTP one:

```javascript
const https = require('https');
const fs = require('fs');
const app = require('./app'); // your Express app

const options = {
  key: fs.readFileSync('./certs/key.pem'),
  cert: fs.readFileSync('./certs/cert.pem'),
};

const PORT = process.env.PORT || 5000;

https.createServer(options, app).listen(PORT, () => {
  console.log(`HustleHub+ API running securely on https://localhost:${PORT}`);
});
```

Add `certs/` to `.gitignore` — the private key must never be committed, even for a local-only certificate. Each teammate generates their own local certificate rather than sharing one.

When testing in Postman, only disable SSL certificate verification in Settings if you skip `mkcert -install`. Otherwise, trust the mkcert CA as shown above and leave verification on — this is the safer option, since it mirrors how a real client would behave.
