# Prompt siap tempel — Cloud Agent · PNC Nexus MVP

> **Instruksi ke Cloud Agent:** Bangun aplikasi web produksi dari nol menurut prompt ini. Jangan port HTML/CSS demo mentah. UI **Bahasa Indonesia**. Patuhi larangan compliance. Selesai = AC + DoD di bawah hijau + README cara jalanin + seed.

**Status handoff:** Paket produk siap. Build menunggu **GitHub URL** (Origin Free blocked). Tempel prompt ini ke Cloud Agent **hanya setelah** repo GitHub terhubung Cursor.

---

## 1. Produk

- **Nama:** PNC Nexus (final, terkunci)
- **Tagline:** Daftar. Tersalurkan. Berkembang.
- **Owner:** PurwaNendi Candrayana
- **MVP:** satu registrasi + **tiga jalur tipis:** kerja · komoditi · pemerintahan
- **Bukan:** deep marketplace, payment, chat realtime, integrasi LPSE/SPSE API

Satu portal mitra (kontraktor / UMKM / pelaku usaha) → disalurkan ke peluang kerja, listing komoditi, dan info terkait pemerintahan (dampingan internal).

---

## 2. Stack

Next.js **App Router** + **TypeScript** + **Tailwind** + **shadcn/ui** + auth email/password + database (pilih Prisma/Drizzle + Postgres atau SQLite untuk staging — dokumentasikan di README) + role guard.

Role: `mitra` | `operator` | `admin`

---

## 3. Sumber kebenaran (di repo / workspace)

Utama: `PRODUCT_BRIEF_MVP.md`  
Lengkapi: `UX_COPY_DECK.md`, `USER_JOURNEYS.md`, `QA_ACCEPTANCE.md`, `SEED_CONTENT.md`, `INFORMATION_ARCHITECTURE.md`, `BRAND_VOICE.md`  
Demo alur saja (jangan disalin mentah): repo/folder `pnc-partner-network`  
Compliance Research: `briefs/pnc-nexus-compliance-brief-2026-09-08.md`

Jika file belum ada di repo GitHub, **embed di bawah ini cukup** untuk membangun MVP.

---

## 4. Routes wajib

| Route | Peran | Isi |
|-------|-------|-----|
| `/` | publik | Landing + CTA + 3 pilar |
| `/masuk` `/daftar` | publik | Auth |
| `/onboarding` | mitra baru | Tipe → profil → ≥1 jalur minat |
| `/ringkasan` | login | KPI + aktivitas |
| `/profil` | mitra | Edit + status verifikasi |
| `/mitra` | ops/admin | Direktori + filter |
| `/kerja` `/kerja/[id]` | mitra+ | List/detail; **apply hanya mitra terverifikasi** |
| `/komoditi` (+ form/detail) | mitra+ | Listing + tertarik |
| `/pemerintahan` `/[id]` | mitra+ | **Disclaimer di atas**; dampingan + checkbox |
| `/pipeline` | ops/admin | Kanban: Baru · Ditinjau · Dihubungi · Tersalurkan · Tidak cocok |
| `/admin` | admin | Approve mitra, CRUD, KPI, export CSV |

Nav mitra: Ringkasan · Kerja · Komoditi · Pemerintahan · Profil  
+ Mitra · Pipeline (ops) · + Admin (admin)

---

## 5. Acceptance criteria (wajib dicentang)

### A. Auth & onboarding
- Daftar + login email/password
- Wizard: tipe individu/badan, nama, kota/provinsi, WA, deskripsi, upload 1 file opsional
- Pilih ≥1 jalur: `kerja` | `komoditi` | `pemerintahan`
- Status awal mitra: `menunggu_verifikasi`

### B. Profil & direktori
- Mitra edit profil sendiri
- Ops/Admin filter status + jalur + kota
- Admin set: `menunggu_verifikasi` | `terverifikasi` | `ditolak` | `ditangguhkan`

### C. Kerja
- CRUD peluang (judul, deskripsi, lokasi, jenis, deadline?, `buka`|`tutup`)
- Semua login boleh **lihat**; **apply hanya `terverifikasi`** + catatan singkat
- Mitra lihat status aplikasi; ops lihat inbox per peluang
- Framing UI = **papan lowongan mitra** (lihat §7)

### D. Komoditi
- Listing: nama, kategori, volume/unit, harga indikatif opsional (label **indikatif · penawaran mitra**), asal/tujuan, catatan
- Status `draft`|`aktif`|`ditutup`; minat “Saya tertarik”; antrian ops

### E. Pemerintahan
- **Banner disclaimer §6 di setiap view** — tidak dismiss permanen
- Item: judul, ringkasan, sumber info teks, tanggal, status, deep-link INAPROC opsional
- Hanya “Minta dampingan (internal)” + checkbox pemahaman
- Zero UI tiruan LPSE/SPSE; zero login/upload SPSE; zero “daftar tender di sini”

### F. Pipeline & admin
- Pindah kartu 5 kolom; catat `updated_at` + actor
- KPI: total mitra, terverifikasi, peluang terbuka, aplikasi, listing aktif
- Export CSV mitra **atau** aplikasi (minimal satu)

### G. UX
- UI ID; responsif dasar; empty/error jelas
- Role guard ketat (mitra ↛ `/admin` `/pipeline`)

---

## 6. Disclaimer pemerintahan (wajib verbatim)

**Banner (setiap view modul):**

> **Informasi bukan portal resmi.**  
> Halaman ini **bukan** situs pemerintah, **bukan** LPSE/SPSE, dan **bukan** kanal pendaftaran tender resmi. Isi di sini hanya informasi/pendampingan jaringan internal untuk membantu mitra memahami peluang yang mungkin relevan.  
> **Tidak ada jaminan** menang tender, lolos prakualifikasi, mendapat proyek, atau mendapat dukungan pejabat. Keputusan pengadaan ada pada pihak berwenang sesuai peraturan yang berlaku.  
> Jangan mengunggah atau meminta dokumen rahasia negara. Verifikasi selalu ke sumber resmi sebelum mengambil tindakan.

**Checkbox dampingan (wajib):**

> Saya memahami bahwa platform ini bukan portal resmi pemerintah dan tidak menjamin hasil pengadaan/tender. Saya akan memverifikasi informasi ke sumber resmi.

**Footer (disarankan):**

> PNC Nexus adalah platform jaringan mitra independen. Tidak berafiliasi sebagai portal resmi pemerintah Republik Indonesia.

**CTA eksternal bila URL ada:** `Buka di INAPROC` (buka di luar app).

---

## 7. Compliance UI do-nots (BLOCKER jika dilanggar)

| Modul | JANGAN | AMAN |
|-------|--------|------|
| **Kerja** | Klaim agen TK resmi / LPK penyalur / PPTKS / job portal berizin Kemnaker; jamin placement; fee/biaya ke pencari kerja | Papan lowongan mitra; perekrutan oleh pemberi kerja |
| **Komoditi** | HET/HPP/SPHP/harga pemerintah; stok nasional; BPOM/SNI tanpa bukti | Penawaran mitra; harga indikatif |
| **Pemerintahan** | Tiru LPSE/SPSE; jamin menang tender; login/upload SPSE di app | Info + dampingan + deep-link INAPROC |

Juga out of scope MVP: payment/escrow, chat realtime, API LPSE, multi-bahasa non-ID, auto-matching ML.

---

## 8. Entitas inti

`User` (role) · `MitraProfile` (status verifikasi, jalur minat) · `PeluangKerja` · `Aplikasi` (unique per mitra+peluang) · `ListingKomoditi` · `MinatKomoditi` · `PeluangPemerintahan` · `Dampingan` (wajib timestamp centang disclaimer) · `PipelineCard` (kolom + ref + updatedBy)

Apply kerja: tolak jika status ≠ `terverifikasi`.  
Ditangguhkan/ditolak: blokir apply kerja & buat listing baru.

---

## 9. Seed wajib (staging)

Password demo dokumentasikan di README, contoh: `NexusDemo2026!`

| Akun | Email | Catatan |
|------|-------|---------|
| admin | admin@pnc.nexus | full admin |
| operator | ops@pnc.nexus | pipeline + mitra |
| mitra menunggu | budi.wait@demo.nexus | Budi Santoso, Yogyakarta — jalur kerja |
| mitra verifikasi kerja | rina.kerja@demo.nexus | CV Rina Teknik Mandiri, Semarang — kerja+pemerintahan |
| mitra verifikasi komoditi | agus.komoditi@demo.nexus | UD Agus Makmur Niaga, Surabaya |

Konten: ≥2 peluang kerja (1 dengan aplikasi Rina); ≥2 listing (beras dalam negeri + lada minat ekspor, label penawaran mitra); ≥2 item pemerintahan + disclaimer; ≥3 kartu pipeline di kolom berbeda. Detail nama/copy: ikuti `SEED_CONTENT.md` bila ada.

---

## 10. Copy CTA inti

- Daftar sebagai mitra  
- Kirim minat ke peluang ini (disabled + helper jika belum verifikasi)  
- Buat listing / Saya tertarik  
- Minta dampingan (internal)  
- Buka di INAPROC  

Empty: “Belum ada listing. Buat listing pertama Anda.” / pemerintahan: pantau halaman atau lengkapi profil.

---

## 11. Definition of Done

Build MVP selesai bila:
1. Semua AC §5 hijau di staging  
2. Disclaimer §6 muncul di setiap view pemerintahan  
3. Admin verifikasi 1 mitra demo + 1 peluang per jalur + pipeline bergerak  
4. Kasus negatif **FAIL** jika terjadi: disclaimer hilang; apply tanpa verifikasi; role leak; copy melanggar §7  
5. README: install, env, `dev`, akun demo, catatan seed  
6. Tidak ada payment/chat/integrasi LPSE  

---

## 12. Urutan implementasi disarankan

1. Scaffold Next.js + auth + role + layout nav ID  
2. Onboarding + MitraProfile + admin approve  
3. Kerja (list/detail/apply guard)  
4. Komoditi (listing/minat)  
5. Pemerintahan (disclaimer-first + dampingan + optional INAPROC link)  
6. Pipeline kanban + admin KPI + CSV  
7. Seed + README + self-check `QA_ACCEPTANCE.md`

---

## 13. Larangan eksplisit untuk agent

- Jangan launch fitur di luar MVP di atas  
- Jangan menyalin demo statis `pnc-partner-network` sebagai produksi  
- Jangan hilangkan disclaimer atau soft-hide compliance  
- Jangan hardcode rahasia nyata; pakai env  
- Jangan klaim izin Kemnaker / LPSE / Bapanas di UI  

**Mulai bangun sekarang sesuai prompt ini.**
