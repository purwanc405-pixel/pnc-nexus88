# AC — Notifikasi P0 (in-app + email opsional)

**Tanggal:** 15 Okt 2026 · **Status:** diimplementasikan di PR `feat/notifikasi-p0`

## 1. Model data (migrasi ADITIF)
- [x] Tabel baru `Notification` (`id, userId, type, title, body, link, readAt, createdAt`) + index `(userId, readAt)` & `(userId, createdAt)`, FK ke `User` (cascade).
- [x] Migrasi `20261015000000_add_notification` hanya `CREATE TABLE/INDEX` + FK. **Tidak ada** drop/rename tabel/kolom lama.
- [x] Migrasi juga menyisipkan notifikasi demo **hanya** untuk 5 akun demo (jika ada); idempoten (`ON CONFLICT DO NOTHING`).

## 2. Trigger
| Peristiwa | Penerima | Link |
|---|---|---|
| Mitra menyelesaikan onboarding (pertama kali) | semua admin + operator | `/mitra` |
| Admin mengubah status mitra (approve/tolak/tangguhkan) | mitra tsb | `/profil` |
| Mitra mengirim minat kerja (aplikasi baru) | pemilik peluang + operator* | `/kerja/[id]` |
| Ops/admin mengubah status aplikasi | pelamar | `/kerja/[id]` |
| Listing komoditi baru | operator | `/komoditi` |

\* `PeluangKerja` belum punya kolom pemilik; peluang dibuat oleh admin/ops, jadi "pemilik" = tim admin + operator. Tanpa duplikat, pelaku tidak menerima notifikasi dirinya sendiri.
- [x] Notifikasi hanya dibuat jika status benar-benar berubah.
- [x] Kegagalan notifikasi/email **tidak pernah** menggagalkan aksi user (try/catch + log).

## 3. UI
- [x] Ikon lonceng di nav (user login) dengan badge jumlah belum dibaca (`99+` jika >99).
- [x] Halaman `/notifikasi` (wajib login, middleware): daftar terbaru dulu, penanda belum dibaca, tombol **Buka** (tandai dibaca + menuju link), **Tandai dibaca**, **Tandai semua sudah dibaca**.
- [x] Role-scoped: query & update selalu difilter `userId` sesi; user tidak bisa membaca/menandai milik user lain.

## 4. Email opsional
- [x] Dikirim via Resend **hanya** jika env `RESEND_API_KEY` dan `NOTIFY_FROM` diset; jika tidak, dilewati diam-diam + log `[notifikasi] email dilewati`.
- [x] Timeout 5 detik; gagal = log saja. Tidak ada secret yang ditambahkan ke repo.

## 5. Seed
- [x] `prisma/seed.ts` membuat 2–3 notifikasi per akun demo (staging/lokal).

## 6. Kepatuhan
- [x] Copy disclaimer pemerintahan & footer tidak diubah. Tidak ada biaya untuk pencari kerja, tidak ada klaim "portal resmi".

## 7. Deploy & migrasi
- [x] Script `vercel-build` = `prisma generate && node scripts/migrate-deploy.mjs && next build`.
- [x] `migrate-deploy.mjs`: `prisma migrate deploy`; jika DB dibuat via `db push` (P3005) migrasi init ditandai applied (baseline) lalu deploy diulang. Gagal ⇒ build gagal ⇒ deployment lama tetap aktif. Tidak pernah reset/`--accept-data-loss`.

## 8. Verifikasi
- [x] `tsc --noEmit`, `next build` lulus.
- [x] `npm test` (node:test, DB Postgres lokal): trigger ×5, read-state, scoping, email skip/gagal aman.
- [x] Smoke Playwright: lonceng ada angka, `/notifikasi` berisi item, tandai dibaca mengurangi badge; `/kerja`, `/komoditi`, `/pemerintahan` (banner), `/admin` tetap 200.
