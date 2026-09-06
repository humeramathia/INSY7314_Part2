# HustleHub+ — Part 1

HustleHub+ is a secure freelance marketplace. Freelancers advertise services; clients browse and book those services. Bookings create simulated payment records so freelancers can later see income and estimated tax.

Part 1 delivers the **secure backend foundation**: a Node.js and Express API for registration, login, and a JWT-protected route, served over HTTPS.

---

## Table of contents

1. [Group members](#group-members)
2. [System and intended users](#system-and-intended-users)
3. [Architecture](#architecture)
4. [Backend structure](#backend-structure)
5. [How to run](#how-to-run)
6. [API endpoints](#api-endpoints)
7. [Request flow](#request-flow)
8. [Security decisions](#security-decisions)
9. [Testing, screenshots, and demonstration](#testing-screenshots-and-demonstration)

---

## Group members

| Name | Student number | Role on Part 1 |
| --- | --- | --- |
| **Humera Mathia** (Group Leader) | ST10276384 | Node.js / Express API: folder layout, routes, controllers, models, file-based user storage, register / login / protected `/me`, HTTPS server, integration onto `main` |
| **Mohammed Ba Yazed** | ST10174227 | Password hashing (bcrypt), JWT sign/verify and secret handling, input validation (including malicious / unexpected fields) |
| **Lilitha Mlobi** | ST10454944 | MERN architecture diagram, security write-up (hashing, JWT, validation, HTTPS), HTTPS setup documentation |
| **Imraan Nordien** | ST10434419 | Postman collection (success and invalid cases), API response screenshots, demonstration video |

---

## System and intended users

HustleHub+ will eventually support three roles:

| Role | Intended use |
| --- | --- |
| **Client** | Browse gigs and book services |
| **Freelancer** | Create gigs, view bookings, track income and tax |
| **Admin** | Manage the platform |

Part 1 does **not** include gigs, bookings, or a React UI. It only proves that users can register and log in **securely**, and that later requests can be identified with a JWT.

Sensitive data in this part includes **credentials** (email and password) and **identity** (user id and role). Those are treated as security-critical from the first commit, not added later.

User records are stored in a local file (`src/data/users.json`) so the API can run without MongoDB. The file is gitignored. Hashing, validation, and JWT still happen **before** anything is written, so the same security layer can sit in front of MongoDB in Part 2.

---

## Architecture

![Architecture diagram](./Architecture%20Diagram%20.png)

The diagram follows a **MERN** layout (MongoDB, Express, React, Node.js) with a security boundary at each tier:

| Tier | Part 1 status | Boundary |
| --- | --- | --- |
| **Client (React SPA)** | Not built yet | Will call the API over HTTPS only. Must not store plaintext passwords. After login it may keep the JWT. |
| **Server (Node.js + Express)** | Implemented | The only process that accepts client requests. Every request is filtered before business logic. |
| **Data** | File store (`users.json`) | Replaced by MongoDB later. The store never sees a plaintext password. |

On the server, a request is processed in this order:

1. **HTTPS** — the connection is encrypted before Express reads the body.
2. **Validation** — missing, invalid, or unexpected input is rejected.
3. **Authentication (JWT)** — public routes (register, login) skip this; protected routes must present a valid Bearer token.
4. **Controllers** — create the user, issue a token, or return the current user.
5. **Model / storage** — persist or read a user **after** hashing and checks.

Routes, controllers, middleware, and models are separate so validation and JWT checks cannot be skipped by putting logic in one large file.

---

## Backend structure

```text
hustlehub-plus/
├── Architecture Diagram .png      # MERN + security boundaries (Lilitha)
├── README.md
├── .env.example                   # PORT, JWT_SECRET, JWT_EXPIRES_IN (no real secret)
├── .gitignore                     # .env, certs, users.json, node_modules
├── package.json
├── certs/                         # local SSL files (not committed)
│   └── .gitkeep
├── postman/                       # Imraan: collection + screenshots
│   └── .gitkeep
├── scripts/
│   └── generate-certs.js          # npm run certs → local HTTPS certificate
└── src/
    ├── server.js                  # HTTPS server only
    ├── app.js                     # Express app, JSON parser, route mount
    ├── config/
    │   └── index.js               # PORT + JWT secret from .env
    ├── routes/
    │   └── authRoutes.js          # URL wiring only
    ├── controllers/
    │   └── authController.js      # register, login, me
    ├── models/
    │   └── userModel.js           # file-based user storage
    ├── middleware/
    │   ├── authMiddleware.js      # verify JWT on protected routes
    │   ├── validateRegister.js
    │   ├── validateLogin.js
    │   ├── errorMiddleware.js     # safe JSON errors, no stack traces
    │   └── notFound.js
    ├── utils/
    │   ├── password.js            # hashPassword, comparePassword (bcrypt)
    │   ├── jwt.js                 # signToken, verifyToken
    │   └── response.js            # { success, message, data }
    └── data/
        └── .gitkeep               # users.json created at runtime, gitignored
```

**Why this split:** `routes` only map URLs. `middleware` enforces security before a controller runs. `utils` hold hashing and JWT so those algorithms are not copied into controllers. `models` own storage. That matches the rubric (routes, controllers, and models separated) and makes each security control testable on its own.

---

## How to run

```bash
npm install
copy .env.example .env
npm run certs
npm run dev
```

On macOS or Linux use `cp .env.example .env`.

1. Put a long random value in `.env` for `JWT_SECRET`. Never commit `.env`.
2. `npm run certs` creates `certs/key.pem` and `certs/cert.pem` (gitignored).
3. The API listens on **`https://localhost:3000`**.

Health check: `GET https://localhost:3000/api/health`

In Postman, use `https://` and turn **SSL certificate verification** off (self-signed local certificate).

---

## API endpoints

Base URL: `https://localhost:3000`

| Method | Path | Access | Success |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Public | `200` |
| `POST` | `/api/auth/register` | Public | `201` |
| `POST` | `/api/auth/login` | Public | `200` |
| `GET` | `/api/auth/me` | Bearer JWT | `200` |

Roles: `client` \| `freelancer` \| `admin`

**Success:** `{ "success": true, "message": "...", "data": {} }`  
**Error:** `{ "success": false, "message": "..." }`  
Passwords are never returned in `data`.

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
| Unknown email or wrong password | `401` (same message for both) |

`data` includes `token` and `user`.

### Current user (protected)

`GET /api/auth/me`  
Header: `Authorization: Bearer <token>`

This is the Part 1 route **beyond login**. The JWT is validated on **every** call.

| Case | Status |
| --- | --- |
| No token | `401` |
| Invalid or expired token | `401` |

---

## Request flow

**Register:** HTTPS → `validateRegister` → controller checks duplicate email → `hashPassword` → `createUser` → `201` without password.

**Login:** HTTPS → `validateLogin` → find user → `comparePassword` → `signToken({ id, role })` → `200` with token.

**Protected `/me`:** HTTPS → `authMiddleware` reads `Bearer` token → `verifyToken` → `req.user` → `findById` → `200` without password.

If any step fails, the client gets a controlled JSON error. Stack traces, file paths, and configuration values are not sent.

---

## Security decisions

Each control below is in the running API. The **why** is what the Part 1 rubric asks for.

### Password hashing

**What:** Passwords are hashed with **bcryptjs, 12 salt rounds** (`hashPassword`) before they are saved. Login uses `comparePassword` (`bcrypt.compare`). Plaintext is never stored or returned.

**Why:** If `users.json` is copied, logged, or leaked, a slow salted hash is expensive to reverse. Rainbow tables do not help because bcrypt salts each password. A fast hash (MD5, SHA-1) or plaintext would turn one leaked file into a full account takeover. Twelve rounds is slow enough for attackers and still acceptable for register and login. Hashing happens in the controller **before** the model writes the file, so storage never sees the original password.

### Token-based authentication (JWT)

**What:** Login returns a JWT signed with `JWT_SECRET` from `.env`. The payload is only `id` and `role`. Protected routes send `Authorization: Bearer <token>`. `authMiddleware` calls `verifyToken` on **every** protected request. `/me` is the Part 1 protected route.

**Why:** The API stays **stateless** — the server does not keep a session table to know who is calling. Signing (not only encoding) means a client cannot change `id` or `role` without breaking the signature. A small payload limits what is exposed if a token is stolen. The secret lives in `.env` (gitignored) so it is not in GitHub; a hard-coded secret would be public as soon as the repo is pushed. Validating on every protected request prevents someone from calling `/me` with a missing, expired, or forged token.

### Input validation

**What:** `validateRegister` and `validateLogin` run **before** controllers. They require the right fields, a real email, a strong password, an allowed role, and they **reject unexpected fields**.

**Why:** The API is the first place an attacker can send data. Checking at the boundary means every route uses the same rules; a controller cannot “forget” to validate. Unexpected fields block extra JSON that might be used to smuggle privileges or junk into storage. A weak password (`secret123`) is rejected because hashing a guessable password still leaves the account easy to break. Login failures use the same `"Invalid email or password"` message so the API does not reveal whether an email is registered.

### HTTPS

**What:** `src/server.js` always uses `https.createServer` with a local certificate (`certs/key.pem`, `certs/cert.pem`). There is no HTTP fallback. Certificates are generated with `npm run certs` and are not committed.

**Why:** Hashing and JWT signing do not help if the login body (password) or later `Authorization` headers (JWT) travel in clear text. On a shared network, HTTP would expose both. Serving HTTPS in development also finds certificate mistakes now, instead of only in production. The browser “Not secure” warning on a **self-signed** cert is expected; the connection is still TLS. Postman should use `https://localhost:3000` with SSL verification off for that local cert.

### Controlled error handling

**What:** `errorMiddleware` returns `{ success: false, message: "Something went wrong" }` for unexpected failures. Unknown URLs return JSON `404`. Validation and auth errors use the same `{ success, message }` shape.

**Why:** Raw Express errors can leak stack traces, file paths, framework versions, or env details. That helps an attacker map the server. A short, consistent JSON body is enough for Postman and the UI without exposing internals.

---

## Testing, screenshots, and demonstration

Imraan Nordien (ST10434419) owns evidence for the Part 1 submission:

| Deliverable | Location |
| --- | --- |
| Postman collection (successful register/login **and** invalid cases) | `postman/` |
| Screenshots of API responses | `postman/` (or as required on the cover sheet) |
| Demonstration video (API running, register, login with token) | Link below |

**Demonstration video:** _to be added by Imraan_

The collection should cover at least: register `201`, duplicate `409`, weak/missing fields `400`, login `200` with token, wrong password `401`, `/me` with token `200`, `/me` without token `401`.
