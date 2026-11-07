# Deploy HustleHub+ from the release package

This zip is the Docker Compose deployment package. GitHub Actions builds it only after **Build and tests** is green (backend, frontend, static analysis, containers, Newman, and Playwright).

## Requirements

- Docker Desktop (or Docker Engine with Compose v2)
- A long random value for `JWT_SECRET`

## Run

```bash
unzip hustlehub-plus-deployment.zip
cd hustlehub-plus
cp .env.example .env
```

Edit `.env` and replace `JWT_SECRET` with your own secret. Do not commit `.env`.

```bash
docker compose up --build -d --wait
```

| URL | What opens |
| --- | --- |
| http://localhost:8080 | Website |
| https://localhost:3000/api/health | API health (accept the self-signed certificate once) |
| http://localhost:3001 | Grafana (local demo `admin` / `admin`) |

Stop with `docker compose down`. Add `-v` only if you also want to delete MongoDB data.

## What is not in the zip

Secrets (`.env`, certificate private keys, Postman local secrets) are never packed. The API image generates its own TLS files at build time.
