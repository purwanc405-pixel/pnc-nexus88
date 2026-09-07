# PNC Nexus — MVP

**Daftar. Tersalurkan. Berkembang.**

Portal mitra independen (kontraktor / UMKM / pelaku usaha) dengan tiga jalur tipis: **kerja · komoditi · pemerintahan**.

UI Bahasa Indonesia. Stack: Next.js App Router + TypeScript + Tailwind + Prisma + PostgreSQL (Neon/Docker) + session cookie (JWT).

Produk authority: folder `docs/` (mirror dari paket produk).

## Cara menjalankan

```bash
# 1) Install
npm install

# 2) Env
cp .env.example .env
# DATABASE_URL postgresql://... (Neon atau Docker) + AUTH_SECRET

# 3) Database + seed demo
npm run db:setup

# 4) Dev
npm run dev
# buka http://localhost:3000

# Build produksi
npm run build && npm start
```

Database: PostgreSQL. Lihat docs/DEPLOY.md untuk Vercel + Neon free.

## Akun demo

Password semua akun seed: **`NexusDemo2026!`**

| Role | Email | Catatan |
|------|-------|---------|
| admin | `admin@pnc.nexus` | full admin, KPI, CSV, approve mitra |
| operator | `ops@pnc.nexus` | mitra + pipeline |
| mitra (menunggu) | `budi.wait@demo.nexus` | Budi Santoso, Yogyakarta — jalur kerja |
| mitra (terverifikasi kerja) | `rina.kerja@demo.nexus` | CV Rina Teknik Mandiri — kerja + pemerintahan |
| mitra (terverifikasi komoditi) | `agus.komoditi@demo.nexus` | UD Agus Makmur Niaga — komoditi |

## Routes

`/` `/masuk` `/daftar` `/onboarding` `/ringkasan` `/profil` `/mitra` `/kerja` `/kerja/[id]` `/komoditi` `/pemerintahan` `/pemerintahan/[id]` `/pipeline` `/admin`

## Compliance (wajib)

- **Kerja:** papan lowongan mitra — bukan agen TK / LPK / PPTKS; tidak ada fee ke pencari kerja.
- **Komoditi:** penawaran mitra; harga indikatif (bukan HET/HPP).
- **Pemerintahan:** banner disclaimer penuh di setiap view; hanya "Minta dampingan (internal)" + checkbox; deep-link INAPROC opsional. Bukan LPSE/SPSE.
- Out of scope MVP: payment, chat realtime, API LPSE.

## Deploy (Vercel + Neon free)

See docs/DEPLOY.md: Neon free DB, set Vercel env DATABASE_URL + AUTH_SECRET + COOKIE_SECURE=1, run prisma db push (or migrate deploy) + optional seed, then redeploy.

## Scripts

| Script | Fungsi |
|--------|--------|
| `npm run dev` | development server |
| `npm run build` | prisma generate + next build |
| `npm run db:setup` | db push + seed |
| `npm run db:seed` | seed ulang |

## Catatan

- Apply kerja hanya mitra `terverifikasi`.
- Mitra `ditolak` / `ditangguhkan` tidak bisa buat listing baru.
- Role guard: middleware memblokir mitra dari `/admin`, `/pipeline`, dan `/mitra` (direktori); `/admin` hanya admin; operator boleh `/pipeline` + `/mitra`. Form error memakai redirect + searchParams (bukan throw).
