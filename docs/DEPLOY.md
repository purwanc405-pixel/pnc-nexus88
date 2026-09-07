# Deploy PNC Nexus → Vercel + Neon (free)

Stack production: **Next.js on Vercel** + **Neon Postgres (free tier)**. No paid plans required.

SQLite is **not** used in production (serverless cannot persist a local `.db` file).

---

## 1. Neon (free Postgres)

1. Sign up at [console.neon.tech](https://console.neon.tech) (free).
2. Create a project (e.g. `pnc-nexus`).
3. Copy the connection string (**Connection string** → URI).
   - Prefer the **pooled** connection for Vercel serverless (host often contains `-pooler`).
   - Ensure `?sslmode=require` is present.
4. Placeholder shape:

```text
postgresql://USER:PASSWORD@ep-xxxx-pooler.REGION.aws.neon.tech/neondb?sslmode=require
```

Owner / CoS pastes the real URI into Vercel env (this repo never commits secrets).

---

## 2. Vercel env vars

In [vercel.com](https://vercel.com) → project →"**Settings → Environment Variables**, set for **Production** (and Preview if desired):

| Name | Value | Notes |
|------|-------|------|
| `DATABASE_URL` | Neon URI (pooled + `sslmode=require`) | Required |
| `AUTH_SECRET` | long random string | `openssl rand -base64 32` |
| `COOKIE_SECURE` | `1` | HTTPS on Vercel |
| `OPS_NOTIFY_EMAIL` | optional | stub mailto in UI |
| `OPS_NOTIFY_WA` | optional | stub WA link in UI |

### CLI (optional)

```bash
# after: npm i -g vercel && vercel login && vercel link
vercel env add DATABASE_URL production
vercel env add AUTH_SECRET production
vercel env add COOKIE_SECURE production   # value: 1
vercel --prod
```

Or use the dashboard, then **Deployments → ... → Redeploy**.

---

## 3. Schema sync (one-time / after schema changes)

Vercel **build** only runs `prisma generate` (via `postinstall` / `npm run build`). It does **not** migrate or seed automatically (keeps `postinstall` safe on Vercel).

### Option A – `db push` (simple MVP)

From a machine with Node + this repo, with production `DATABASE_URL` in the env:

```bash
export DATABASE_URL="postgresql://…neon‥/neondb?sslmode=require"
npx prisma db push
npm run db:seed    # optional: demo accounts (password NexusDemo2026!)
```

### Option B – migrate

```bash
export DATABASE_URL="postgresql://…"
npx prisma migrate deploy   # if prisma/migrations/ already committed
# first time from empty Neon (local, then commit migrations):
npx prisma migrate dev --name init
npx prisma migrate deploy
npm run db:seed
```

Re-run seed only when you want demo data reset (seed **deletes** existing rows first).

---

## 4. Import / redeploy on Vercel

1. Import repo `purwanc405-pixel/pnc-nexus88` (or connect GitHub).
2. Framework preset: **Next.js** (`vercel.json` already sets this).
3. Set env vars above → **Deploy**.
4. After first successful deploy + `db push` (+ optional seed), open the production URL and sign in with demo accounts (see README) or register new mitra.

Build does **not** need a live DB for `prisma generate`. Still set `DATABASE_URL` in Vercel so runtime works. A dummy URL is enough only for local generate-only checks:

```bash
DATABASE_URL="postgresql://user:pass@localhost:5432/pnc?schema=public" AUTH_SECRET=dev npm run build
```

---

## 5. Local DX (Postgres, not SQLite)

Use the **same Neon free DB** (dev branch) **or** Docker:

```bash
docker run --name pnc-pg -e POSTGES_PASSWORD=postgres -e POSTGRES_DB=pnc_nexus -p 5432:5432 -d postgres:16
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pnc_nexus"
cp .env.example .env   # edit DATABASE_URL & AUTH_SECRET
npm install
npm run db:setup       # prisma db push + seed
npm run dev
```

---

## 6. Checklist

- [ ] Neon project created; pooled URI copied
- [ ] Vercel: `DATABASE_URL`, `AUTH_SECRET`, `COOKIE_SECURE=1`
- [ ] `prisma db push` (or migrate deploy) against Neon once
- [ ] Optional: `npm run db:seed`
- [ ] Redeploy Vercel; smoke login
