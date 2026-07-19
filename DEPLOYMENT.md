# Deployment Guide — eLearners Academy

This app is a standard **Next.js 15** application with **Prisma**. It ships two supported
production paths. Pick one.

---

## Option A — Docker on a VPS (recommended, self-contained)

Everything runs in one container with **SQLite on a persistent volume**. No external database
to manage. Great for a single server behind a domain.

### 1. Prepare env
```bash
cp .env.production.example .env.production
node scripts/gen-secret.mjs        # paste the NEXTAUTH_SECRET into .env.production
# set NEXTAUTH_URL="https://your-domain.com"
```

### 2. Launch
```bash
docker compose up -d --build
```
The container applies the schema, seeds starter content on first boot, and serves on `:3000`.
Data persists in the `ela-data` volume.

### 3. Put it behind your domain (TLS)
Terminate HTTPS with a reverse proxy. Example **Caddy** (`/etc/caddy/Caddyfile`) — automatic Let's Encrypt:
```
your-domain.com {
    reverse_proxy localhost:3000
}
```
Or **Nginx** + certbot proxying to `http://localhost:3000`.

Health check: `GET https://your-domain.com/api/health` → `{"status":"ok"}`.

---

## Option B — Managed platform + Postgres (Vercel, Railway, Render, Fly)

Serverless/ephemeral filesystems can't use SQLite. Switch to Postgres:

1. **Change the datasource** in `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Provision a Postgres database and set `DATABASE_URL` to its connection string.
3. Set the other env vars (`NEXTAUTH_SECRET`, `NEXTAUTH_URL`, optional keys).
4. Create the schema and seed:
   ```bash
   npx prisma db push        # or: npx prisma migrate deploy
   npm run db:seed           # optional starter content
   ```
5. Build & start: `npm run build && npm start` (platforms do this automatically).

> On Vercel: add the env vars in the project settings, set the Build Command to
> `prisma generate && next build`, and connect a Postgres add-on (Neon/Supabase/Vercel Postgres).

---

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | ✅ | DB connection (`file:/data/prod.db` or Postgres URL) |
| `NEXTAUTH_SECRET` | ✅ | Session signing secret (`node scripts/gen-secret.mjs`) |
| `NEXTAUTH_URL` | ✅ | Public site URL, e.g. `https://your-domain.com` |
| `ANTHROPIC_API_KEY` | optional | Live Claude answers for the AI tutor (falls back to built-in tutor) |
| `INTASEND_PUBLISHABLE_KEY` / `INTASEND_SECRET_KEY` | optional | Enable real payments (M-Pesa/card/bank) |
| `INTASEND_TEST_MODE` | optional | `"true"` for sandbox keys, `"false"` for live |
| `INTASEND_WEBHOOK_CHALLENGE` | optional | Shared secret to verify IntaSend webhooks |

Without IntaSend keys, checkout runs in **simulated mode** (enrolls immediately) so the app is
fully usable in demos.

---

## Payments (IntaSend) go-live

1. Create an account at <https://intasend.com> and get your API keys.
2. Set `INTASEND_PUBLISHABLE_KEY`, `INTASEND_SECRET_KEY`, and `INTASEND_TEST_MODE="false"`.
3. In the IntaSend dashboard, add a **webhook**: `https://your-domain.com/api/webhooks/intasend`,
   and (recommended) set a challenge, mirrored in `INTASEND_WEBHOOK_CHALLENGE`.
4. Test a purchase end-to-end with sandbox keys first, then switch to live.

Flow: cart → `/api/checkout` creates a `PENDING` order and redirects to IntaSend →
buyer pays → IntaSend calls the webhook → the order is marked `PAID` and the buyer is enrolled.

---

## Post-deploy checklist

- [ ] `NEXTAUTH_SECRET` is a fresh 32-byte random value (not the dev default)
- [ ] `NEXTAUTH_URL` matches the live domain (HTTPS)
- [ ] `/api/health` returns `ok`
- [ ] Change the demo account passwords (or delete the demo users)
- [ ] TLS certificate installed and auto-renewing
- [ ] Database volume is backed up (SQLite: back up the `.db` file; Postgres: managed backups)
- [ ] IntaSend switched to live keys + webhook verified (if selling)

---

## Operations

```bash
# logs
docker compose logs -f app
# re-seed / reset demo data
docker compose exec app npx tsx prisma/seed.ts
# open a shell
docker compose exec app sh
# back up the SQLite database
docker compose cp app:/data/prod.db ./backup-$(date +%F).db
```
