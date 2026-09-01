# HustleHub+

Secure freelance marketplace API (Part 1 backend). Freelancers advertise services; clients browse and book. This repo implements a Node.js/Express auth API: register, login, and a JWT-protected profile route.

## Run

```bash
npm install
copy .env.example .env
npm run certs
npm run dev
```

On macOS/Linux use `cp .env.example .env`. Set a long random `JWT_SECRET` in `.env` before sharing or demoing. Never commit `.env`.

The API is served over HTTPS at `https://localhost:3000` using a local SSL certificate in `certs/`. Those files are gitignored; each teammate runs `npm run certs` once.

Health check: `GET https://localhost:3000/api/health`

## Response shape

Success:

```json
{ "success": true, "message": "...", "data": {} }
```

Error:

```json
{ "success": false, "message": "..." }
```

Passwords are never returned in `data`.

## Auth endpoints

Base URL: `https://localhost:3000`

| Method | Path | Access | Success |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | `201` |
| POST | `/api/auth/login` | Public | `200` |
| GET | `/api/auth/me` | Bearer JWT | `200` |

Roles: `client` | `freelancer` | `admin`

### Register

`POST /api/auth/register`

```json
{
  "name": "Ada Lovelace",
  "email": "ada@test.com",
  "password": "Secret123!",
  "role": "client"
}
```

Password must be 8–128 characters and include uppercase, lowercase, a number, and a special character.

| Case | Status |
| --- | --- |
| Missing or invalid fields | `400` |
| Weak password | `400` |
| Invalid role | `400` |
| Duplicate email | `409` |

### Login

`POST /api/auth/login`

```json
{
  "email": "ada@test.com",
  "password": "Secret123!"
}
```

| Case | Status |
| --- | --- |
| Missing fields | `400` |
| Unknown email or wrong password | `401` |

`data` includes `token` and `user`.

### Current user

`GET /api/auth/me`

Header: `Authorization: Bearer <token>`

| Case | Status |
| --- | --- |
| No token | `401` |
| Invalid token | `401` |

## System overview and intended users

HustleHub+ is a freelance marketplace where freelancers post gigs and clients browse and book them. Bookings create simulated financial transactions. Freelancers will later see income and estimated tax on a dashboard. The platform handles credentials, transactions, and income, so security is designed in from the start.

Part 1 is limited to a secure register/login API. Users are stored in a local file (`src/data/users.json`), not MongoDB yet. Hashing, validation, and authentication still run before anything is saved, so the security layer can stay in place when a database is added.

## Architecture

![Architecture diagram](./Architecture%20Diagram%20.png)

The diagram shows the MERN architecture and the security boundary for each layer:

- **Client tier (React SPA)** — the UI talks to the API only over HTTPS in the intended design, never stores plaintext passwords, and keeps only the JWT after login. The React app is not built in Part 1.
- **Server tier (Node.js + Express)** — the only server the client may call. Requests pass through security layers before business logic:
  1. **Auth & JWT** — issues a token on login and identifies the user on protected routes.
  2. **Validation & sanitisation** — rejects missing, invalid, or unexpected input before it reaches a controller.
  3. **Routes & controllers** — register, login, and the protected `/me` route.
- **Data tier** — file-based user storage for Part 1; MongoDB will replace this later without moving hashing or JWT into the store.

Keeping routes, controllers, middleware, and models in separate folders is a security choice as well as a structure choice: validation cannot be skipped by accident, and each layer can be tested on its own.

## Security decisions

### Password hashing

Passwords are hashed with **bcryptjs (12 salt rounds)** via `hashPassword` before they are saved. Plaintext is never stored. Login uses `comparePassword` (`bcrypt.compare`) against the stored hash.

**Why:** if the user file is leaked, the hash is slow to reverse and salted, so rainbow tables are not useful. Twelve rounds is a balance between brute-force cost and acceptable register/login time.

### Token-based authentication (JWT)

On successful login the API returns a JWT with the user's `id` and `role`, signed with `JWT_SECRET` from `.env`. Later requests send `Authorization: Bearer <token>`. `GET /api/auth/me` (and any later protected route) validates the token on every request through `authMiddleware`.

**Why:** the API stays stateless. A signed token cannot have its `id`/`role` changed without failing verification. The payload is small (no password, no full profile). The secret is not in the repository.

### Input validation

Register and login bodies are validated before controllers run: required fields, email format, password strength, allowed roles (`client` | `freelancer` | `admin`), and rejection of unexpected fields.

**Why:** this blocks malformed data, injection-style payloads, and unexpected extra fields before they reach storage.

### HTTPS

The API is served over HTTPS with a locally generated SSL certificate (`certs/key.pem` and `certs/cert.pem`) so passwords and JWTs are not sent in clear text.

**Why:** hashing and signing do not help if login and Bearer tokens travel over plain HTTP on a shared network.

### Controlled error handling

`errorMiddleware` returns `{ success: false, message }` and does not send stack traces, file paths, or configuration values.

## HTTPS — local setup

Certificate files are gitignored. Each teammate generates their own:

```bash
npm run certs
```

This creates a local self-signed certificate for `localhost` using OpenSSL (included with Git for Windows). `src/server.js` always starts an HTTPS server with those files. If they are missing, the process exits and tells you to run `npm run certs`.

In Postman:
1. Use `https://localhost:3000/...` (not `http://`)
2. Settings → turn **SSL certificate verification** off (needed for a self-signed local cert)

Do not commit `certs/key.pem` or `certs/cert.pem`.

## Project structure

```
src/
  app.js
  server.js
  config/          PORT and JWT settings
  routes/          URL wiring only
  controllers/     register, login, me
  models/          user storage (src/data/users.json)
  middleware/      auth, validation, errors
  utils/           password, jwt, response helpers
certs/             local HTTPS certificates (not committed)
postman/           Postman collection (teammate)
Architecture Diagram .png
```

## Agreed function names

- `hashPassword`, `comparePassword`
- `signToken`, `verifyToken`
- `authMiddleware`
- `validateRegister`, `validateLogin`
- `errorMiddleware`

User data is stored in `src/data/users.json` (gitignored). The file is created automatically on first register.
