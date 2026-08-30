# HustleHub+

Secure freelance marketplace API (Part 1 backend). Freelancers advertise services; clients browse and book. This repo currently implements the Node.js/Express auth API: register, login, and a JWT-protected profile route.

## Run

```bash
npm install
copy .env.example .env
npm run dev
```

On macOS/Linux use `cp .env.example .env`. Set a long random `JWT_SECRET` in `.env` before sharing or demoing. Never commit `.env`.

The API listens on `http://localhost:3000` (or `PORT` if set).

Health check: `GET http://localhost:3000/api/health`

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

Base URL: `http://localhost:3000`

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
certs/             HTTPS certificates (teammate)
postman/           Postman collection (teammate)
```

## Agreed function names

Keep these names so security work can plug in without changing controllers:

- `hashPassword`, `comparePassword`
- `signToken`, `verifyToken`
- `authMiddleware`
- `validateRegister`, `validateLogin`
- `errorMiddleware`

Passwords are hashed with bcrypt (`hashPassword` / `comparePassword`). JWTs are signed with `JWT_SECRET` from `.env` and include `id` and `role`. Input is validated before controllers run. HTTPS and the demo/Postman collection are owned by teammates.

User data is stored in `src/data/users.json` (gitignored). The file is created automatically on first register.
