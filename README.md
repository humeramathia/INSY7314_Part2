# HustleHub+ — Final submission (Parts 1–3)

HustleHub+ is a secure freelance marketplace. Freelancers advertise services. Clients browse and book those services. Confirmed bookings create simulated payment records so freelancers can see income and a **SARS-based tax estimate**. Because the platform holds passwords, identity, and money-related data, security is designed in from the first version, not added afterwards (The Independent Institute of Education, 2026; Open Worldwide Application Security Project, 2021).

This repository is the **complete application**: Part 1 authentication, Part 2 gigs/bookings/transactions on MongoDB with a React client, and Part 3 tax estimation, Docker Compose, extra security controls, logging, and this documentation.

**Demonstration video:** [HustleHub+ Part 2 demo](https://youtu.be/eevV5RWQjZc) (Nordien, 2026). The Part 1 API demo remains at [https://youtu.be/DcsFY8W7TBE](https://youtu.be/DcsFY8W7TBE).

---

## Table of contents

1. [Group members](#group-members)
2. [System and intended users](#system-and-intended-users)
3. [Architecture diagram explained for a non-technical reader](#architecture-diagram-explained-for-a-non-technical-reader)
4. [Backend structure](#backend-structure)
5. [How to run](#how-to-run)
6. [Run with Docker Compose](#run-with-docker-compose)
7. [API endpoints](#api-endpoints)
8. [Request flow](#request-flow)
9. [Tax estimation](#tax-estimation)
10. [Security decisions](#security-decisions)
11. [Own security features](#own-security-features)
12. [Security review](#security-review)
13. [Logging](#logging)
14. [Testing, screenshots, and demonstration](#testing-screenshots-and-demonstration)
15. [Pipeline configuration](#pipeline-configuration)
16. [OWASP ZAP results](#owasp-zap-results)
17. [Reference list](#reference-list)
18. [Disclosure of AI usage in this assessment](#disclosure-of-ai-usage-in-this-assessment)

---

## Group members

| Name | Student number | Role on Part 2 |
| --- | --- | --- |
| **Humera Mathia** (Group Leader) | ST10276384 | Node.js / Express API: gigs, bookings, transactions, HTTPS server, React client, frontend Vitest suite, integration onto `main` |
| **Mohammed Ba Yazed** | ST10174227 | MongoDB users and security: bcrypt, JWT, validation, sanitisation, rate limiting, Helmet/CSP |
| **Lilitha Mlobi** | ST10454944 | Wire the React UI to the live API: auth context, protected routes, gig/booking/income screens |
| **Imraan Nordien** | ST10434419 | Postman collection, Newman runs, API response screenshots, demonstration video |

---

## System and intended users

Imagine a digital marketplace, like a noticeboard plus a cash register. Three kinds of people will use it:

| Who | What they need from the system |
| --- | --- |
| **Client** | Find a service and book it |
| **Freelancer** | List a service, see bookings, later see income and tax |
| **Admin** | Look after the platform |

Part 2 builds the **website, gigs, bookings, and income views**. A person can still **create an account**, **log in**, and prove “it is still me” with a JWT. On top of that, clients book gigs, freelancers manage listings and income, and an admin oversees users. The Independent Institute of Education (2026) requires hashing, tokens, validation, sanitisation, rate limiting, Helmet/CSP, and HTTPS because credentials and money-related records are in play.

Sensitive data in this part is the **email and password**, the **user id and role**, and **booking and transaction records**. Those never travel or sit in storage in a careless way.

Users, gigs, bookings, and transactions are saved in **MongoDB** (`hustlehub` on port `27017`). Hashing and checks still happen **before** anything is written (MongoDB, Inc., 2024). Public registration only allows `client` or `freelancer`; admin accounts are created with `npm run create-admin`.

---

## Architecture diagram explained for a non-technical reader

If you have never built software, treat the picture below as a **three-storey building**. A customer does not walk into the basement filing room. They enter the shop (the website), speak to reception (the API), and only reception is allowed to open the cabinets (storage). That three-storey idea is what industry calls a **tiered** or **MERN** layout.

**MERN** is four tools that fit those storeys (MongoDB, Inc., 2024; OpenJS Foundation, n.d.; Meta Platforms, 2024; OpenJS Foundation, 2024):

| Letter | Tool | Plain English | Where it sits on the diagram |
| --- | --- | --- | --- |
| **M** | MongoDB | A professional database for users, gigs, and bookings | Orange **Data tier** at the bottom |
| **E** | Express | A rulebook: “if someone asks for this address, do this job” | Inside the blue **Server tier** |
| **R** | React | The clickable website in the browser | Green **Client tier** at the top |
| **N** | Node.js | The engine that runs the server | The same blue **Server tier** |

**Figure 1:** HustleHub+ architecture, security features, and system boundaries (authors’ own diagram, 2026).

![Architecture diagram](./Architecture%20Diagram%20.png)

### Storey 1 — green box: Client tier (React SPA)

This is the **shop window**: the HustleHub+ screen a person would open in Chrome or Edge. “SPA” means single-page application: the page does not fully reload for every click (Meta Platforms, 2024).

**Part 2 status:** this website **is built**. The React SPA lives in `client/` and runs on `http://localhost:5173`. Postman can still send the same messages for API evidence.

**Boundary:** the browser (or Postman) may only talk to the server over **HTTPS**. It must never keep a raw password. After login it may keep a **JWT** in `sessionStorage` (`hh_token`) — think of a signed, time-limited visitor badge that dies when the tab closes — not the password itself (Jones, Bradley and Sakimura, 2015).

### The arrow between green and blue — HTTPS (TLS)

The arrow labelled **HTTPS (TLS)** is a **locked tunnel** between the shop window and reception. TLS is the lock on that tunnel (Rescorla, 2018). That is why every address starts with `https://localhost:3000`, not `http://`.

Without this arrow, someone on the same Wi-Fi could read a password on login or a token on later requests. Hashing and JWT signing would then be pointless, because the secret would already have been stolen in transit (Rescorla, 2018; Open Worldwide Application Security Project, 2021).

The browser may show “Not secure” for our **self-signed** local certificate. That warning means the computer does not recognise our homemade stamp; the traffic is still encrypted. Postman should use HTTPS and turn SSL certificate verification off for this local stamp.

### Storey 2 — blue box: Server tier (Node.js + Express)

This is **reception**. It is the only part of the building the public is allowed to speak to. The diagram marks this as the **system boundary: reachable only over HTTPS**. Nobody on the internet is allowed to open MongoDB. They must go through this box (OpenJS Foundation, n.d.; OpenJS Foundation, 2024).

Inside reception the diagram shows three purple desks. A message is handled **in order**:

1. **HTTPS** — the tunnel is opened and the body can be read safely.
2. **Validation** — is the form complete and legal?
3. **Auth & JWT** — if this is a private room, is the visitor badge valid?
4. **Routes & controllers** — do the actual job (register, login, gigs, bookings, income, or admin).
5. **Queries** — ask MongoDB to save or find a user, gig, booking, or transaction.

#### Purple desk: Auth & JWT

On **register**, the password is **hashed** (turned into a one-way scramble) before it is stored (Provos and Mazières, 1999). On **login**, the scramble is compared and the server **issues a token** that carries `id`, `role`, and a unique `jti` (Jones, Bradley and Sakimura, 2015). On later calls such as `/me`, the same desk checks that badge. If the badge is missing, fake, expired, or logged out, the door stays closed.

#### Purple desk: Validation

This desk reads the form **before** any filing happens. Missing name, weak password, bad email, or a role such as `"manager"` is stopped here. Extra unexpected fields are thrown away so nobody can smuggle extra data into storage. Checking at the door means a later piece of code cannot “forget” to check (Open Worldwide Application Security Project, 2021).

#### Purple desk: Routes & controllers

These are the jobs reception is willing to do. In Part 2 the jobs that exist are:

- register a user (`client` or `freelancer` only)
- log in and receive a token
- `/me` — “show me who this badge belongs to”
- gigs — list, create, edit, and delete listings
- bookings — create, list, and confirm
- income — freelancer totals from confirmed bookings
- admin — list all gigs

### Storey 3 — orange box: Data tier

This is the **filing cabinet**. The arrow labelled **Queries** is reception asking: “save this user” or “find this email”.

**Part 2:** the cabinet is **MongoDB**, the “M” in MERN (MongoDB, Inc., 2024). Collections hold users, gigs, bookings, and transactions. The green shop and blue reception stay; this floor is no longer a local JSON file.

The cabinet **never** sees a plaintext password. It only ever stores a bcrypt hash. Gigs, bookings, and transactions are queried through Mongoose models in `src/models/`.

### System boundaries (who may touch what)

A **boundary** is a fence. If you ignore the fence, you have no security, only hope.

| Actor | May talk to | Must not talk to |
| --- | --- | --- |
| Browser / Postman (client) | Server, and only over HTTPS | MongoDB |
| Server (Node + Express) | Client (answers) and storage (queries) | The internet except through HTTPS |
| Storage (MongoDB) | Server only | The public internet |

**Public rooms** (health, register, login, browse gigs): anyone may knock; they still pass HTTPS and validation.  
**Private rooms** (`/me`, own gigs, bookings, income, admin): every knock must show a valid JWT, and some rooms also check role. That is the line on the diagram between “anyone can ask” and “only people with a badge get in”.

---

## Backend structure

```text
hustlehub-plus/
├── Architecture Diagram .png
├── README.md
├── .env.example
├── .gitignore
├── Dockerfile                     # HTTPS API image
├── docker-compose.yml             # mongo + api + web
├── package.json
├── client/                        # React Vite SPA (port 5173 / Docker 8080)
│   ├── Dockerfile
│   └── nginx.conf
├── certs/                         # local SSL files (not committed)
├── postman/
│   ├── HustleHub-Part1.postman_collection.json
│   ├── HustleHub-Part2.postman_collection.json
│   ├── local-secrets.example.json
│   └── screenshots/               # Part 1 and Part 2 Postman images
├── scripts/
│   ├── generate-certs.js
│   └── create-admin.js            # bootstrap an admin (not public register)
└── src/
    ├── server.js                  # HTTPS only
    ├── app.js
    ├── config/                    # MongoDB connection
    ├── routes/
    ├── controllers/
    ├── models/                    # user, gig, booking, transaction, token denylist
    ├── middleware/
    └── utils/                     # hashing, JWT, SARS tax estimate, logger
```

Routes only map addresses. Middleware enforces security before a controller runs. Utils hold hashing and JWT. Models own storage. That split is itself a boundary: validation cannot be skipped by hiding logic in one large file (The Independent Institute of Education, 2026).

---

## How to run

Install [MongoDB Community](https://www.mongodb.com/try/download/community) and start the service so it listens on `27017`. Copy `.env.example` to `.env` and keep `MONGODB_URI=mongodb://127.0.0.1:27017/hustlehub`.

```bash
npm install
copy .env.example .env
npm run certs
npm run dev
```

On macOS or Linux use `cp .env.example .env`.

1. Set a long random `JWT_SECRET` in `.env`. Never commit `.env`.
2. `npm run certs` creates `certs/key.pem` and `certs/cert.pem` (gitignored).
3. The API listens on **`https://localhost:3000`** and talks to MongoDB on **`27017`**.

Health check: `GET https://localhost:3000/api/health`

### React client

The SPA uses Vite. `VITE_API_URL` defaults to `https://localhost:3000`. Accept the API self-signed certificate in the browser first (open the API health URL once), then start the client:

```bash
cd client
npm install
npm run dev
```

Open **`http://localhost:5173`**. The API still uses HTTPS; the client talks to it over that locked tunnel.

### Create an admin

Public `POST /api/auth/register` only accepts `client` or `freelancer`. To bootstrap an admin, set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env` (see `.env.example`) and run:

```bash
npm run create-admin
```

The script hashes the password with bcrypt (12 rounds) and writes a user with role `admin`. Do not expose this as a public signup form.

---

## Run with Docker Compose

The backend API and the frontend are **separate images**. Docker Compose starts MongoDB, the HTTPS API, and an nginx-hosted React build together (Docker, Inc., 2024).

1. Copy `.env.example` to `.env` and set a long random `JWT_SECRET`. Do not commit `.env`.
2. From the repo root:

```bash
npm run docker:up
```

That is the same as `docker compose up --build -d`. Stop with `npm run docker:down`.

| Service | Image | Host port | Role |
| --- | --- | --- | --- |
| `mongo` | `mongo:7` | not published | Database `hustlehub` |
| `api` | built from `./Dockerfile` | `3000` | HTTPS Express API (non-root user) |
| `web` | built from `./client/Dockerfile` | `8080` | Static React client |

Open **`http://localhost:8080`** for the website. The browser still talks to **`https://localhost:3000`**. Accept the self-signed certificate once (visit the health URL) the same way as local development.

The API image generates its own TLS files at **build** time. Compose overrides `MONGODB_URI` to `mongodb://mongo:27017/hustlehub` so the API talks to the Mongo container, not `127.0.0.1`. `JWT_SECRET` still comes from `.env`. `CORS_ORIGINS` includes `http://localhost:8080`.

Stop the stack with `docker compose down`. Data in the `hustlehub_mongo` volume survives unless you add `-v`.

Proof that the stack is up:

```bash
docker compose ps
curl -k https://localhost:3000/api/health
```

---

## API endpoints

Base URL: `https://localhost:3000`

| Method | Path | Access | Success |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Public | `200` |
| `POST` | `/api/auth/register` | Public (`client` or `freelancer`) | `201` |
| `POST` | `/api/auth/login` | Public | `200` |
| `POST` | `/api/auth/logout` | Bearer JWT | `200` |
| `GET` | `/api/auth/me` | Bearer JWT | `200` |
| `GET` | `/api/gigs` | Public | `200` |
| `GET` | `/api/gigs/:id` | Public | `200` |
| `GET` | `/api/gigs/mine` | Freelancer JWT | `200` |
| `POST` | `/api/gigs` | Freelancer JWT | `201` |
| `PUT` | `/api/gigs/:id` | Freelancer owner JWT | `200` |
| `DELETE` | `/api/gigs/:id` | Freelancer owner JWT | `200` |
| `POST` | `/api/bookings` | Client JWT | `201` |
| `GET` | `/api/bookings/mine` | Client or freelancer JWT | `200` |
| `POST` | `/api/bookings/:id/confirm` | Client JWT | `200` |
| `GET` | `/api/transactions/mine` | Freelancer JWT | `200` |
| `GET` | `/api/admin/gigs` | Admin JWT | `200` |

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

Password must be 8–128 characters and include uppercase, lowercase, a number, and a special character (Grassi, Garcia and Fenton, 2017).

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
| Account locked after five failed logins | `423` |

`data` includes `token` and `user`. Five failed passwords on the same account lock it for 15 minutes (see [Own security features](#own-security-features)).

### Logout (token denylist)

`POST /api/auth/logout`  
Header: `Authorization: Bearer <token>`

The current token’s `jti` is stored until it would have expired. Later requests with that token return `401`.

### Current user (protected)

`GET /api/auth/me`  
Header: `Authorization: Bearer <token>`

This is the protected identity route **beyond login**. The JWT is validated on **every** call (The Independent Institute of Education, 2026; Jones, Bradley and Sakimura, 2015). Part 2 adds the gig, booking, income, and admin routes in the table above. Each of those still checks the token, and most also check role.

| Case | Status |
| --- | --- |
| No token | `401` |
| Invalid or expired token | `401` |

---

## Request flow

**Register:** HTTPS → `validateRegister` → duplicate-email check → `hashPassword` → `createUser` → `201` without password.

**Login:** HTTPS → `validateLogin` → find user → lockout check → `comparePassword` → `signToken({ id, role, jti })` → `200` with token.

**Logout:** HTTPS → JWT → store `jti` on the denylist → `200`.

**Protected `/me`:** HTTPS → `authMiddleware` reads `Bearer` → `verifyToken` → denylist check → `findById` → `200` without password.

**Create gig:** HTTPS → freelancer JWT → `validateGig` → Mongo insert → `201`.

**Create booking:** HTTPS → client JWT → booking rate limit → `validateBooking` → Mongo insert → `201`.

**Confirm booking:** HTTPS → client JWT → booking must belong to the caller and still be pending → transaction row → `200` or `409` if already confirmed.

Failures return controlled JSON. Stack traces, file paths, and configuration values are not sent (Open Worldwide Application Security Project, 2021).

---

## Tax estimation

South Africa taxes **individuals** on a progressive scale. SARS publishes the brackets and the **primary rebate** for each year of assessment (South African Revenue Service, 2025). HustleHub+ uses the **2025/26** table (1 March 2025 – 28 February 2026), the latest published individual rates used for this POE.

The estimate lives in `src/utils/taxEstimate.js` and is returned on `GET /api/transactions/mine`. Only **confirmed** freelance income on this platform is treated as taxable income. That is a simplification: a real return would include other income, deductions, age rebates, medical tax credits, and possibly turnover tax or VAT (South African Revenue Service, 2025). The UI labels the figure as an estimate, not advice.

### Method

1. Sum confirmed transaction amounts for the logged-in freelancer (`totalIncome`).
2. Find the SARS bracket that contains that amount.
3. Tax before rebate = bracket base + (income − bracket floor) × marginal rate.
4. Subtract the **primary rebate** of **R17 235** (person under 65). Tax cannot go below R0.
5. Net income = gross − estimated tax. Effective rate = tax ÷ gross × 100.

| Taxable income (R) | Formula used (2025/26) |
| --- | --- |
| 0 – 237 100 | 18% of taxable income |
| 237 101 – 370 500 | R42 678 + 26% of the amount above R237 100 |
| 370 501 – 512 800 | R77 362 + 31% of the amount above R370 500 |
| 512 801 – 673 000 | R121 475 + 36% of the amount above R512 800 |
| 673 001 – 857 900 | R179 147 + 39% of the amount above R673 000 |
| 857 901 – 1 817 000 | R251 258 + 41% of the amount above R857 900 |
| 1 817 001 and above | R644 489 + 45% of the amount above R1 817 000 |

Worked example: R100 000 of confirmed gigs sits in the first bracket. Tax before rebate = R18 000. After the R17 235 rebate the estimate is **R765**. R300 000 uses the second bracket: R42 678 + 26% × (R300 000 − R237 100) = R59 032, then minus R17 235 = **R41 797**.

Income data is **not** a public endpoint. Only the freelancer’s JWT can read their transactions. Amounts travel over HTTPS and JSON responses send `Cache-Control: no-store`.

### Frontend dashboard

The React **Income** page (`client/src/pages/IncomePage.jsx`) shows:

- three summary cards: total income, estimated tax, amount after tax
- a donut for income vs tax (effective and marginal rates)
- a bar chart of income by UTC month
- the calculation method and disclaimer from the API

Run `npm run test:tax` for the bracket tests. Frontend coverage is in `npm run test:client`.

---

## Security decisions

The brief asks not only **what** was used, but **why** (The Independent Institute of Education, 2026).

### Password hashing

**What:** Passwords are hashed with **bcryptjs, 12 salt rounds** before save. Login uses `bcrypt.compare`. Plaintext is never stored or returned (Provos and Mazières, 1999).

**Why:** If the MongoDB users collection leaks, a slow salted hash is expensive to reverse. Rainbow tables fail because each password gets its own salt. A fast hash (MD5, SHA-1) or plaintext would turn one stolen dump into a full takeover (Provos and Mazières, 1999; Open Worldwide Application Security Project, 2021). Twelve rounds is slow enough for attackers and still acceptable for register and login. Hashing happens **before** the model writes to MongoDB.

### Token-based authentication (JWT)

**What:** Login returns a JWT signed with `JWT_SECRET` from `.env`. The payload is `id`, `role`, and `jti`. Protected routes send `Authorization: Bearer <token>`. `authMiddleware` verifies the token on **every** protected request (Jones, Bradley and Sakimura, 2015).

**Why:** The API stays **stateless**: the server does not keep a session table. Signing means a client cannot change `id` or `role` without breaking the signature. A small payload limits what is exposed if a token is stolen. The secret is not in GitHub. Checking every time stops `/me` from being called with a missing, expired, or forged token.

### Input validation

**What:** `validateRegister` and `validateLogin` run before controllers. They require the right fields, a real email, a strong password, an allowed role, and they reject unexpected fields.

**Why:** The API is the first place an attacker can send data. One door policy means a controller cannot skip checks (Open Worldwide Application Security Project, 2021). A weak password is refused because hashing a guessable password still leaves the account easy to break (Grassi, Garcia and Fenton, 2017). Login uses one message, `"Invalid email or password"`, so the API does not confirm whether an email is registered.

### HTTPS

**What:** `src/server.js` always uses `https.createServer` with a local certificate. There is no HTTP fallback.

**Why:** Hashing and JWT do not help if the password or token crosses the network in clear text (Rescorla, 2018). Serving HTTPS in development also finds certificate mistakes now, not only in production.

### Controlled error handling

**What:** Unexpected errors return `{ success: false, message: "Something went wrong" }`. Unknown URLs return JSON `404`. JSON responses use `Cache-Control: no-store` so tokens and user records are not cached.

**Why:** Raw errors can leak stack traces, paths, or configuration and help an attacker map the server (Open Worldwide Application Security Project, 2021).

### Rate limiting, Helmet, body size, and sanitisation

**What:** Login is limited to **5 failed attempts per 15 minutes** (`skipSuccessfulRequests: true`), so a normal session does not burn the budget. Registration has **its own** 5-per-15-minute limiter. Booking routes are limited to 10 per 15 minutes. Helmet sets CSP on the API. The React client also sends a CSP (meta tag plus Vite `server.headers`). JSON bodies are capped at **10kb**. Request bodies are sanitised before controllers run.

**Why:** Brute-force login and booking spam are slowed at the door. Successful logins are not punished. CSP reduces XSS impact in the browser. A small JSON limit stops oversized payloads. Sanitisation strips unexpected or dangerous input so Mongo queries and HTML views do not receive raw attacker strings (Open Worldwide Application Security Project, 2021).

### Public register cannot create admin

**What:** `validateRegister` and the auth controller only allow `client` or `freelancer`. The React register form has no Admin option. Admin accounts are created with `npm run create-admin`.

**Why:** An open signup that accepts `admin` would let anyone grant themselves platform privileges. Privilege must be issued by an operator, not by the public form.

---

## Own security features

These two controls are **not** in the POE minimum list (hashing, JWT, validation, sanitisation, rate limiting, Helmet/CSP, HTTPS). They are extra, functional, and required for Part 3 (The Independent Institute of Education, 2026).

### 1. Per-account lockout after failed logins

**Where:** `src/models/userModel.js`, `src/controllers/authController.js`

**What:** Each user document stores `failedLoginAttempts` and `lockUntil`. A wrong password increments the counter. After **five** failures the account is locked for **15 minutes** and login returns **HTTP 423**. A correct password clears the counter. Unknown emails still return the same `401` message so lockout does not become a user-enumeration oracle.

**Why this is not the same as rate limiting:** `express-rate-limit` is keyed by **IP**. A botnet can spread guesses across addresses; a single attacker can also lock out a whole classroom NAT. Account lockout follows the **identity**, which is what NIST treats as a defence against online guessing (Grassi, Garcia and Fenton, 2017).

### 2. JWT denylist on logout

**Where:** `src/models/tokenDenylist.js`, `src/utils/jwt.js`, `src/middleware/authMiddleware.js`, `POST /api/auth/logout`

**What:** Every access token carries a unique `jti`. Logout writes that id to MongoDB with a TTL equal to the token’s remaining life. `authMiddleware` rejects denylisted tokens with `401`. The React client calls logout before it clears `sessionStorage`.

**Why this is not the same as JWT expiry:** A signed JWT is valid until `exp` unless the server keeps a revocation list (Jones, Bradley and Sakimura, 2015). Without a denylist, a stolen token works until it ages out even after the user clicks Log out. The TTL index drops spent rows so the collection does not grow forever.

---

## Security review

This review maps HustleHub+ controls to the threats the POE asks us to explain (The Independent Institute of Education, 2026; Open Worldwide Application Security Project, 2021).

| Threat | How it shows up here | Control in this codebase |
| --- | --- | --- |
| **Injection** (OWASP A03) | Attacker sends `$gt`, extra JSON keys, or huge bodies hoping MongoDB or Express will execute them | `express-validator` with allow-lists; `sanitiseBody`; Mongoose schemas (not string-concatenated queries); JSON body cap **10kb**; unexpected fields rejected on register/login/gigs/bookings |
| **Cross-site scripting** (OWASP A03) | A gig title or name containing `<script>` is later rendered in another browser | React escapes text by default (Meta Platforms, 2024); Helmet CSP on the API (`default-src 'none'`); React CSP meta + Vite `Content-Security-Policy` header; sanitisation of request bodies |
| **Authentication weaknesses** (OWASP A07) | Stolen dump, guessed password, replayed token, brute force | bcrypt 12 rounds; strong password rule; JWT HS256 with `id` + `role` + `jti`; secret only in `.env`; HTTPS always; login limiter 5/15 min; **account lockout**; **logout denylist**; `sessionStorage` so the token dies with the tab |
| **Access control / IDOR** (OWASP A01) | Client creates gigs, freelancer confirms someone else’s booking, client reads another freelancer’s income | RBAC middleware (`client` / `freelancer` / `admin`); public register cannot choose `admin`; gig update/delete checks owner id; booking confirm checks `clientId`; income queries by `req.user.id` only; Newman cases for cross-user 403 |
| **Broken session / token theft** | Token copied from logs or cache | Tokens never logged; `Cache-Control: no-store`; HTTPS; short `JWT_EXPIRES_IN` (default 1h); logout denylist |
| **Security misconfiguration** (OWASP A05) | HTTP, open CORS, missing headers, secrets in Git | HTTPS-only server; CORS allow-list (Vite 5173 and Docker 8080); Helmet; `.env` gitignored; Docker API runs as `node`, not root |
| **Denial of service at the door** | Flooded register, login, or booking | Separate register limiter; login limiter with `skipSuccessfulRequests`; booking limiter 10/15 min |

OWASP ZAP baseline and API scans against `https://localhost:3000` reported **0 High / 0 Medium / 0 Low**. Remaining Informational notes are documented under [OWASP ZAP results](#owasp-zap-results).

Residual risk: this is a classroom stack with a **self-signed** certificate and simulated payments. A production deploy would still need a public CA, secrets in the host’s secret store (not a developer laptop `.env`), and cloud log shipping.

---

## Logging

The API writes **one JSON object per line** on stdout (`src/utils/logger.js`). Passwords, JWTs, and `MONGODB_URI` are never included.

| Event | When |
| --- | --- |
| `login.success` | Correct password; includes `userId` and `role` |
| `login.failed` | Unknown email or bad password; lockout flag if the fifth failure just fired |
| `login.locked` | Request while `lockUntil` is still in the future |
| `logout.success` | Token `jti` stored on the denylist |
| `booking.created` | Client booking inserted |
| `booking.confirmed` | Client confirmed a pending booking |
| `transaction.created` | Simulated payment row written |
| `app.error` | Unexpected 500; message only, no stack to the client |

`docker compose logs api` shows the same stream. That format is what a later Grafana/Loki (or similar) sink would scrape; this submission keeps the collector local so Classroom50 does not need extra cloud credentials.

---

## Frontend tests

The React client uses **Vitest** and React Testing Library (`jsdom`). Tests cover login, register, gig list/detail/create/edit, bookings, income, admin, layout, protected routes, and shared components.

From the repo root:

```bash
npm run test:tax
npm run test:client
```

Or from `client/`:

```bash
npm test
```

Coverage output is gitignored (`client/coverage/`).

---

## Testing, screenshots, and demonstration

Imraan Nordien (ST10434419) produced the Postman collections, Newman run, screenshots, and demonstration videos.

**Part 2 demonstration video:** [https://youtu.be/eevV5RWQjZc](https://youtu.be/eevV5RWQjZc) (Nordien, 2026). The recording shows the React client and the live API: register and login, gigs, bookings, income, and admin, as required by The Independent Institute of Education (2026).

**Part 1 demonstration video:** [https://youtu.be/DcsFY8W7TBE](https://youtu.be/DcsFY8W7TBE) (Nordien, 2026). The earlier recording shows the API running over HTTPS, successful registration, and login with token generation.

### 1. Health — API is running (`200`)

`GET /api/health` proves the server is up over HTTPS.

![Health 200](./postman/screenshots/01-health-200.png)

### 2. Register — success (`201`)

A valid body creates a user. The password is not returned.

![Register 201](./postman/screenshots/02-register-201.png)

### 3. Register — missing fields (`400`)

Name is omitted. Validation rejects the request before storage.

![Register missing fields 400](./postman/screenshots/03-register-missing-400.png)

### 4. Register — weak password (`400`)

`secret123` has no uppercase letter (Grassi, Garcia and Fenton, 2017).

![Register weak password 400](./postman/screenshots/04-register-weak-password-400.png)

### 5. Register — invalid role (`400`)

`"manager"` is not allowed. Only `client`, `freelancer`, or `admin`.

![Register invalid role 400](./postman/screenshots/05-register-invalid-role-400.png)

### 6. Register — duplicate email (`409`)

The same email cannot register twice.

![Register duplicate 409](./postman/screenshots/06-register-duplicate-409.png)

### 7. Login — success and JWT (`200`)

Correct credentials return a token (Jones, Bradley and Sakimura, 2015).

![Login 200 token](./postman/screenshots/07-login-200-token.png)

### 8. Login — missing fields (`400`)

Password omitted. Validation runs before login logic.

![Login missing 400](./postman/screenshots/08-login-missing-400.png)

### 9. Login — invalid credentials (`401`)

Wrong password. The message does not reveal whether the email exists.

![Login invalid 401](./postman/screenshots/09-login-invalid-401.png)

### 10. Protected `/me` — no token (`401`)

The route beyond login refuses callers with no JWT.

![Me no token 401](./postman/screenshots/10-me-no-token-401.png)

### 11. Protected `/me` — invalid token (`401`)

`Bearer badtoken` is rejected. The token is checked on every protected request.

![Me bad token 401](./postman/screenshots/11-me-bad-token-401.png)

### 12. Protected `/me` — valid token (`200`)

The login token identifies the user. The password is still not returned.

![Me 200](./postman/screenshots/12-me-200.png)

### Part 2 — Postman, Newman, and extra evidence

Imraan Nordien (ST10434419) added the Part 2 collection (`postman/HustleHub-Part2.postman_collection.json`), Newman as a dev dependency, and the screenshots below. **Every request has tests**: status code plus JSON `success` and `message`. Negatives assert `403` / `401` / `409` / `429` with `success === false` and an error message. Extra cases cover freelancer B updating or deleting freelancer A’s gig, client B not seeing client A’s bookings, and six failed logins that end in `429`.

Copy `postman/local-secrets.example.json` to `postman/local-secrets.json` (gitignored) and fill in passwords for freelancer A/B, client A/B, and admin. The API uses a self-signed certificate, so Newman needs `--insecure`:

```bash
npm install
npm run test:api
```

Frontend tests stay the Vitest suite in `client/` (`npm run test:client`). Imraan’s run matched that suite; we kept it.

#### Part 2 screenshots

| Evidence | File |
| --- | --- |
| Admin gigs | `p2-00-admin-gigs.png` |
| Health `200` | `p2-01-health-200.png` |
| List gigs `200` | `p2-03-list-gigs-200.png` |
| Create gig `201` | `p2-04-create-gig-201.png` |
| Create booking `201` | `p2-05-create-booking-201.png` |
| Confirm booking `200` | `p2-06-confirm-booking-200.png` |
| Income `200` | `p2-07-income-200.png` |
| Client cannot create gig `403` | `p2-08-forbidden-client-create-gig-403.png` |
| Freelancer cannot open admin `403` | `p2-09-forbidden-freelancer-admin-403.png` |
| Freelancer cannot create booking `403` | `p2-10-forbidden-freelancer-booking-403.png` |
| Confirm booking twice `409` | `p2-11-conflict-confirm-booking-409.png` |
| Client cannot read income `403` | `p2-12-forbidden-client-income-403.png` |
| No token `401` | `p2-13-unauthorized-no-token-401.png` |
| Invalid token `401` | `p2-14-unauthorized-invalid-token-401.png` |
| List gigs (variable) `200` | `p2-15-list-gigs-variable-200.png` |
| Get gig by id `200` | `p2-16-get-gig-by-id-200.png` |
| Client bookings `200` | `p2-17-my-bookings-client-200.png` |
| Income (variable) `200` | `p2-18-my-income-variable-200.png` |
| Newman pass | `p2-19-newman-pass.png` |
| Frontend tests pass | `p2-20-frontend-tests-pass.png` |
| Client build pass | `p2-21-build-pass.png` |

![Admin gigs](./postman/screenshots/p2-00-admin-gigs.png)

![Part 2 health 200](./postman/screenshots/p2-01-health-200.png)

![List gigs 200](./postman/screenshots/p2-03-list-gigs-200.png)

![Create gig 201](./postman/screenshots/p2-04-create-gig-201.png)

![Create booking 201](./postman/screenshots/p2-05-create-booking-201.png)

![Confirm booking 200](./postman/screenshots/p2-06-confirm-booking-200.png)

![Income 200](./postman/screenshots/p2-07-income-200.png)

![Forbidden client create gig 403](./postman/screenshots/p2-08-forbidden-client-create-gig-403.png)

![Forbidden freelancer admin 403](./postman/screenshots/p2-09-forbidden-freelancer-admin-403.png)

![Forbidden freelancer booking 403](./postman/screenshots/p2-10-forbidden-freelancer-booking-403.png)

![Confirm booking twice 409](./postman/screenshots/p2-11-conflict-confirm-booking-409.png)

![Forbidden client income 403](./postman/screenshots/p2-12-forbidden-client-income-403.png)

![Unauthorized no token 401](./postman/screenshots/p2-13-unauthorized-no-token-401.png)

![Unauthorized invalid token 401](./postman/screenshots/p2-14-unauthorized-invalid-token-401.png)

![List gigs variable 200](./postman/screenshots/p2-15-list-gigs-variable-200.png)

![Get gig by id 200](./postman/screenshots/p2-16-get-gig-by-id-200.png)

![Client bookings 200](./postman/screenshots/p2-17-my-bookings-client-200.png)

![Income variable 200](./postman/screenshots/p2-18-my-income-variable-200.png)

![Newman pass](./postman/screenshots/p2-19-newman-pass.png)

![Frontend tests pass](./postman/screenshots/p2-20-frontend-tests-pass.png)

![Client build pass](./postman/screenshots/p2-21-build-pass.png)

---

## OWASP ZAP results

OWASP ZAP was run against the live HTTPS API (`https://localhost:3000`, reached from Docker as `host.docker.internal`). Reports live in `zap-reports/`.

| Scan | Report | High | Medium | Low | Informational |
| --- | --- | --- | --- | --- | --- |
| Baseline | [`zap-baseline.md`](./zap-reports/zap-baseline.md) | 0 | 0 | 0 | 1 (cacheable 404s for `/`, `/robots.txt`, `/sitemap.xml`) |
| API scan | [`zap-api.md`](./zap-reports/zap-api.md) | 0 | 0 | 0 | 5 (4xx on protected routes, auth identified, cache directives) |

HTML copies: [`zap-baseline.html`](./zap-reports/zap-baseline.html), [`zap-api.html`](./zap-reports/zap-api.html). JSON: [`zap-baseline.json`](./zap-reports/zap-baseline.json), [`zap-api.json`](./zap-reports/zap-api.json).

A follow-up control script (`zap-reports/control-checks.json`) confirmed HTTPS, HSTS, `X-Content-Type-Options`, CSP, CORS lock, 401/403 RBAC, and `Cache-Control: no-store` on JSON. The remaining Informational cache hits were on empty 404 pages, not on tokens or user records. JSON responses send `Cache-Control: no-store`.

This evidence is kept for the Part 3 security review (The Independent Institute of Education, 2026; Open Worldwide Application Security Project, 2021).

---

## Pipeline configuration

Classroom50 runs `.github/workflows/autograde.yaml` on pushes to `main`. Locally, the commands used to evaluate the stack are:

| Check | Command |
| --- | --- |
| SARS tax unit tests | `npm run test:tax` |
| Logger unit tests | `npm run test:logger` |
| Frontend unit tests (Vitest) | `npm run test:client` |
| Combined local tests | `npm test` |
| API integration (Newman) | `npm run test:api` (needs `postman/local-secrets.json`) |
| Client production build | `npm run build --prefix client` |
| Container stack | `docker compose up --build` |

Passwords, tokens, and Mongo URIs stay in `.env` or gitignored Newman secrets. They are not hardcoded in the workflow file.

---

## Reference list

Cursor, 2026. *Cursor*. [generative AI coding assistant]. Available at: <https://www.cursor.com/> [Accessed 9 October 2026].

Docker, Inc., 2024. *Docker Compose overview*. [online] Available at: <https://docs.docker.com/compose/> [Accessed 6 November 2026].

Grassi, P.A., Garcia, M.E. and Fenton, J.L., 2017. *Digital identity guidelines: authentication and lifecycle management*. NIST Special Publication 800-63B. [online] Gaithersburg: National Institute of Standards and Technology. Available at: <https://doi.org/10.6028/NIST.SP.800-63B> [Accessed 6 September 2026].

Jones, M., Bradley, J. and Sakimura, N., 2015. *JSON web token (JWT)*. RFC 7519. [online] Internet Engineering Task Force. Available at: <https://www.rfc-editor.org/rfc/rfc7519> [Accessed 6 September 2026].

Meta Platforms, 2024. *React*. [online] Available at: <https://react.dev/> [Accessed 6 September 2026].

MongoDB, Inc., 2024. *Introduction to MongoDB*. [online] Available at: <https://www.mongodb.com/docs/manual/introduction/> [Accessed 6 September 2026].

Nordien, I., 2026. *HustleHub+ Part 1 demonstration*. [video online] Available at: <https://youtu.be/DcsFY8W7TBE> [Accessed 6 September 2026].

Nordien, I., 2026. *HustleHub+ Part 2 demonstration*. [video online] Available at: <https://youtu.be/eevV5RWQjZc> [Accessed 12 October 2026].

OpenJS Foundation, 2024. *Node.js documentation*. [online] Available at: <https://nodejs.org/docs/latest/api/> [Accessed 6 September 2026].

OpenJS Foundation, n.d. *Express — fast, unopinionated, minimalist web framework for Node.js*. [online] Available at: <https://expressjs.com/> [Accessed 6 September 2026].

Open Worldwide Application Security Project, 2021. *OWASP top 10:2021*. [online] Available at: <https://owasp.org/Top10/2021/> [Accessed 6 September 2026].

Provos, N. and Mazières, D., 1999. A future-adaptable password scheme. *Proceedings of the FREENIX Track: 1999 USENIX Annual Technical Conference*. Monterey, United States of America, 6–11 June 1999. Berkeley: USENIX Association. Available at: <https://www.usenix.org/legacy/events/usenix99/provos.html> [Accessed 6 September 2026].

Rescorla, E., 2018. *The transport layer security (TLS) protocol version 1.3*. RFC 8446. [online] Internet Engineering Task Force. Available at: <https://www.rfc-editor.org/rfc/rfc8446> [Accessed 6 September 2026].

South African Revenue Service, 2025. *Rates of tax for individuals*. [online] Available at: <https://www.sars.gov.za/tax-rates/income-tax/rates-of-tax-for-individuals/> [Accessed 6 November 2026].

The Independent Institute of Education, 2025. *Guidelines for responsible AI use at The IIE*. [pdf] [s.l.]: The Independent Institute of Education.

The Independent Institute of Education, 2026. *Information systems 3D / Application development security: POE (paper and marking rubric)*. [pdf] [s.l.]: The Independent Institute of Education.

---

## Disclosure of AI usage in this assessment

This annexure follows The IIE’s labelling and disclosure rules for generative AI (The Independent Institute of Education, 2025).

**Section(s) of the assessment where AI was used:** Git merges and branch integration (Humera, Mo, Lilitha, and `main`), not the written security rationale or the original application design.

**Name of AI tool(s) used:** Cursor (Cursor, 2026).

**Purpose / intention behind use:** The group used Cursor to **understand merge conflicts** and to **sort conflicts and branches**. Several people were committing to the same repository. We did not want to delete someone else’s code by mistake while accepting or rejecting conflict markers. Cursor was used as a second pair of eyes to explain what each side of a conflict meant so we could keep the correct Humera, Mo, and Lilitha work. We reviewed every suggested resolution before it was committed. Cursor did not replace group decisions, and we remain responsible for the quality and integrity of this submission (The Independent Institute of Education, 2025).

**Date(s) on which generative AI was used:** September–November 2026, during branch merges onto `Humera` and `main`, and while assembling Part 3 documentation.

**Chat record:** Cursor chats are stored in the local Cursor session used by the group leader. There is no public shareable chat URL. Direct AI wording was not copied into this README or into production code as an unreviewed block.
