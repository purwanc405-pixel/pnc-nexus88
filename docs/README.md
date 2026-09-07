# PNC Nexus — Paket Dokumentasi Produk (MVP)

**Nama produk:** PNC Nexus  
**Owner:** PurwaNendi Candrayana  
**Tagline:** Daftar. Tersalurkan. Berkembang.  
**Bahasa UI:** Indonesia  

---

## Status build

| Item | Status |
|------|--------|
| Paket produk (brief + UX + journey + QA + seed + IA + voice) | **Maksimal siap** |
| Build aplikasi (Next.js) | **Menunggu GitHub URL** |
| Origin Free / Cloud Agent greenfield | **Blocked** — butuh repo GitHub yang terhubung Cursor |
| Demo UI referensi alur | Ada di `/workspace/pnc-partner-network/` (bukan kode produksi) |

> Build Cloud Agent **belum** diluncurkan. Tempel `CLOUD_AGENT_PROMPT.md` ke Cloud Agent setelah URL GitHub tersedia.

---

## Apa isinya

Paket ini adalah **dokumentasi produk saja** (bukan kode aplikasi). Semua file di folder ini siap dibaca principal sibuk dan diserahkan ke Cloud Agent.

| # | File | Isi |
|---|------|-----|
| 0 | [`PRODUCT_BRIEF_MVP.md`](./PRODUCT_BRIEF_MVP.md) | **Sumber kebenaran** — scope, AC, disclaimer, DoD, keputusan terkunci |
| 1 | [`CLOUD_AGENT_PROMPT.md`](./CLOUD_AGENT_PROMPT.md) | Prompt paste-ready, self-contained untuk Cloud Agent |
| 2 | [`UX_COPY_DECK.md`](./UX_COPY_DECK.md) | Copy siap pakai per layar + microcopy + validasi |
| 3 | [`USER_JOURNEYS.md`](./USER_JOURNEYS.md) | 7 journey: langkah, happy path, edge cases |
| 4 | [`QA_ACCEPTANCE.md`](./QA_ACCEPTANCE.md) | Skrip uji AC, checklist DoD, kasus negatif wajib fail |
| 5 | [`SEED_CONTENT.md`](./SEED_CONTENT.md) | Konten demo konkret siap di-seed |
| 6 | [`INFORMATION_ARCHITECTURE.md`](./INFORMATION_ARCHITECTURE.md) | Sitemap, role×route, model entitas |
| 7 | [`BRAND_VOICE.md`](./BRAND_VOICE.md) | Tone ID, kata terlarang, panduan klaim |
| 8 | [`COMPLIANCE_BRIEF.md`](./COMPLIANCE_BRIEF.md) | Pointer + ringkas do-nots tiga modul |
| — | `/workspace/briefs/pnc-nexus-compliance-brief-2026-09-08.md` | Research compliance lengkap (bukan legal opinion) |

---

## Urutan baca (disarankan)

1. **Principal / owner** — `PRODUCT_BRIEF_MVP.md` §1–4 + §8–9 → lalu `BRAND_VOICE.md`
2. **Product / UX** — `UX_COPY_DECK.md` → `USER_JOURNEYS.md` → `INFORMATION_ARCHITECTURE.md`
3. **QA** — `QA_ACCEPTANCE.md` + `SEED_CONTENT.md`
4. **Engineer / Cloud Agent** — `CLOUD_AGENT_PROMPT.md` (sudah embed AC kritis) + brief penuh + seed

---

## Keputusan terkunci (jangan diubah tanpa owner)

- Nama: **PNC Nexus**
- MVP: satu registrasi + tiga jalur tipis: **kerja · komoditi · pemerintahan**
- Apply kerja: **hanya mitra terverifikasi**
- Jalur pemerintahan: **disclaimer-first**, bukan portal resmi, bukan jaminan tender
- Tidak ada payment / chat / integrasi LPSE di MVP
- Stack target: Next.js App Router + TypeScript + Tailwind + shadcn + auth + DB
- UI: Bahasa Indonesia

---

## Out of scope paket ini

- Kode Next.js / komponen produksi
- Peluncuran Cloud Agent
- Integrasi pembayaran, chat, LPSE/SPSE

---

*Diperbarui: 8 September 2026 (WIB)*
