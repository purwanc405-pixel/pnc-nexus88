# Product Brief MVP — PNC Nexus

**Status:** Paket produk maksimal siap; build menunggu GitHub URL (Origin Free blocked) · diperbarui 8 Sep 2026  
**Owner:** PNC_Product  
**Tanggal:** 6 September 2026 (WIB)  
**Nama final:** PNC Nexus (terkunci 6 Sep 2026)  
**Tagline sementara:** Daftar. Tersalurkan. Berkembang.
**Referensi UI/alur (demo lokal):** `/workspace/pnc-partner-network/` (port `8770`) — wizard daftar mitra, peluang kerja, komoditi, pemerintahan, pipeline. Bukan kode produksi; pola layar & alur saja untuk Cloud Agent.

---

## 1. Ringkasan produk

Satu portal registrasi untuk mitra (kontraktor / UMKM / pelaku usaha) yang ingin masuk jaringan PurwaNendi Candrayana, lalu disalurkan ke peluang:

1. **Cari kerja / kontraktor** — lowongan & proyek
2. **Penyaluran komoditi / bisnis** — dalam & luar negeri
3. **Pekerjaan terkait pemerintahan** — info peluang / kemitraan (bukan portal resmi, bukan jaminan tender)

MVP = **satu pintu daftar + tiga jalur tipis** (bukan deep marketplace). UI Bahasa Indonesia.

---

## 2. Persona (MVP)

| Persona | Siapa | Tujuan di MVP | Yang diukur “sukses” |
|--------|--------|---------------|----------------------|
| **Mitra Individu / Freelancer** | Pekerja lepas, tukang, tenaga ahli | Daftar profil, lihat & apply peluang kerja | Profil lengkap + ≥1 aplikasi |
| **Mitra UMKM / Kontraktor** | Usaha kecil–menengah, kontraktor | Daftar badan usaha, masuk pipeline penyaluran | Profil terverifikasi (manual admin) |
| **Pedagang / Supplier Komoditi** | Pedagang dalam/luar negeri | Listing komoditi + minat matching | ≥1 listing aktif |
| **Operator (tim internal)** | Staf jaringan PNC | Review daftar, match mitra ↔ peluang | Status pipeline berubah |
| **Admin** | Owner / admin sistem | Kelola user, konten, laporan ringkas | Dashboard admin jalan |

**Bukan persona MVP:** pejabat pemerintah sebagai user resmi, publik umum tanpa daftar, marketplace open bidding massal.

---

## 3. Prinsip produk

- Satu akun → pilih satu atau lebih jalur minat saat onboarding.
- Verifikasi mitra **manual oleh admin** di MVP (bukan KYC otomatis).
- Semua copy pemerintahan harus **disclaimer-first**.
- Tidak menulis klaim “tender pasti”, “portal resmi LPSE”, atau logo seolah afiliasi pemerintah.
- Stack target (untuk Cloud Agent): Next.js App Router + TypeScript + Tailwind + shadcn, auth + DB, admin dashboard, UI ID.

---

## 3b. Compliance copy (wajib UI) — Research 8 Sep 2026

Sumber: `/workspace/briefs/pnc-nexus-compliance-brief-2026-09-08.md` · detail do-nots di `BRAND_VOICE.md` §4 · ringkas juga §6.5.

| Modul | Framing aman | Larangan utama |
|-------|--------------|----------------|
| **Kerja** | Papan lowongan mitra; perekrutan oleh pemberi kerja | Bukan agen/LPK/PPTKS/job portal berizin; bukan jaminan placement; **tidak** fee ke pencari kerja |
| **Komoditi** | Penawaran mitra; kontrak antar pihak | Bukan HET/HPP/SPHP/harga pemerintah; bukan klaim BPOM/SNI tanpa bukti |
| **Pemerintahan** | Info + dampingan internal; deep-link INAPROC | Bukan LPSE/SPSE; bukan jaminan tender; tanpa login/upload SPSE di app |

Tambah disclaimer satu baris di header modul **Kerja** dan **Komoditi** (selain banner penuh pemerintahan).

---

## 4. Scope MVP (in / out)

### In scope
- Registrasi & login (email + password)
- Onboarding: data profil (individu / badan usaha) + pilih jalur minat
- Direktori mitra (filter dasar: kota, jenis, jalur, status verifikasi)
- Modul **Kerja:** daftar peluang + detail + tombol apply + status aplikasi
  - Framing aman: **papan lowongan mitra** (bukan agen TK resmi / LPK penyalur / PPTKS / job portal berizin). Jangan jamin placement. **Tidak ada fee ke pencari kerja.**
- Modul **Komoditi:** listing komoditi (nama, kategori, volume/unit, asal/tujuan, kontak via platform) + minat “saya tertarik”
  - Framing aman: **penawaran mitra**. Jangan klaim HET/HPP/SPHP/harga pemerintah, stok nasional, atau BPOM/SNI tanpa bukti. Harga = indikatif.
- Modul **Pemerintahan:** board peluang terkait pemerintah/BUMN **dengan disclaimer wajib** + minat/apply internal (bukan ke LPSE)
  - Framing aman: info + dampingan + **deep-link INAPROC** eksternal. Jangan tiru UI LPSE/SPSE; jangan jamin menang tender; jangan login/upload SPSE di app.
- Pipeline operator: kanban sederhana (Baru → Ditinjau → Dihubungi → Tersalurkan / Tidak cocok)
- Admin: approve/reject mitra, CRUD peluang & listing, export CSV ringkas
- Ringkasan dashboard (KPI kasar: mitra, peluang, aplikasi, listing)

### Out of scope (post-MVP)
- Pembayaran / escrow / invoice
- Chat realtime / video call
- Integrasi LPSE / SPSE / API pemerintah
- Auto-matching ML
- App native mobile
- Multi-bahasa penuh (selain ID)
- Open public marketplace tanpa curasi

---

## 5. Acceptance criteria MVP

### A. Auth & onboarding
- [ ] User dapat daftar dengan email + password dan login ulang.
- [ ] Setelah daftar, wizard mengisi: tipe (individu/badan), nama, kota/provinsi, kontak WA, deskripsi singkat, dokumen opsional (upload 1 file).
- [ ] User memilih ≥1 jalur minat: `kerja` | `komoditi` | `pemerintahan`.
- [ ] Status awal mitra: `menunggu_verifikasi` sampai admin mengubahnya.

### B. Profil & direktori
- [ ] Mitra melihat & mengedit profil sendiri.
- [ ] Operator/Admin melihat daftar mitra dengan filter status + jalur + kota.
- [ ] Admin dapat set status: `menunggu_verifikasi` | `terverifikasi` | `ditolak` | `ditangguhkan`.

### C. Jalur Kerja
- [ ] Admin/Operator membuat peluang (judul, deskripsi, lokasi, jenis, deadline opsional, status buka/tutup).
- [ ] Mitra terverifikasi (atau semua mitra login — **asumsi default MVP: semua login boleh lihat; apply hanya jika terverifikasi**) dapat apply dengan catatan singkat.
- [ ] Mitra melihat status aplikasinya; operator melihat inbox aplikasi per peluang.
- [ ] Copy/UI modul = **papan lowongan mitra**; tidak mengklaim agen TK resmi / LPK penyalur / PPTKS / job portal berizin; tidak menjamin placement; **tidak ada fee ke pencari kerja**.

### D. Jalur Komoditi
- [ ] Mitra membuat listing: nama komoditi, kategori, volume/unit, harga indikatif (opsional, label “indikatif · penawaran mitra”), wilayah asal/tujuan, catatan.
- [ ] Mitra lain / operator dapat menandai “tertarik”; operator melihat antrian minat.
- [ ] Listing punya status: `draft` | `aktif` | `ditutup` (admin dapat nonaktifkan).
- [ ] Tidak ada klaim HET/HPP/SPHP/harga pemerintah, stok nasional, atau BPOM/SNI tanpa bukti pada listing.

### E. Jalur Pemerintahan
- [ ] Setiap halaman modul pemerintahan menampilkan **disclaimer penuh** (lihat §6) di atas konten, tidak bisa di-dismiss permanen di MVP.
- [ ] Admin/Operator menambah item peluang (judul, ringkasan, sumber info sebagai teks bebas, tanggal, status, deep-link INAPROC opsional).
- [ ] Tidak ada branding/UI yang meniru LPSE/SPSE; tidak ada login/upload SPSE; tidak ada tombol “daftar tender di sini” / jaminan menang.
- [ ] Mitra hanya bisa “minat / minta dampingan” internal — bukan submit tender. CTA resmi = **Buka di INAPROC** (eksternal) bila URL diisi.

### F. Pipeline & admin
- [ ] Operator memindahkan kartu pipeline antar kolom; perubahan tercatat (updated_at + actor).
- [ ] Admin dashboard menampilkan angka: total mitra, terverifikasi, peluang terbuka, aplikasi masuk, listing aktif.
- [ ] Export CSV: mitra **atau** aplikasi (minimal satu dari keduanya di MVP).

### G. UX / kualitas
- [ ] Seluruh UI primer Bahasa Indonesia.
- [ ] Mobile-readable (layout responsif dasar).
- [ ] Empty state + error state jelas (bukan halaman kosong diam).
- [ ] Role terpisah: `mitra` | `operator` | `admin` (akses route dilindungi).

---

## 6. Copy disclaimer pemerintahan (siap pakai)

### 6.1 Banner modul (wajib di atas setiap view jalur pemerintahan)

> **Informasi bukan portal resmi.**  
> Halaman ini **bukan** situs pemerintah, **bukan** LPSE/SPSE, dan **bukan** kanal pendaftaran tender resmi. Isi di sini hanya informasi/pendampingan jaringan internal untuk membantu mitra memahami peluang yang mungkin relevan.  
> **Tidak ada jaminan** menang tender, lolos prakualifikasi, mendapat proyek, atau mendapat dukungan pejabat. Keputusan pengadaan ada pada pihak berwenang sesuai peraturan yang berlaku.  
> Jangan mengunggah atau meminta dokumen rahasia negara. Verifikasi selalu ke sumber resmi sebelum mengambil tindakan.

### 6.2 Versi singkat (kartu / tooltip)

> Bukan portal resmi & bukan jaminan tender. Hanya info/pendampingan internal jaringan.

### 6.3 Checkbox saat minat/dampingan (wajib dicentang)

> Saya memahami bahwa platform ini bukan portal resmi pemerintah dan tidak menjamin hasil pengadaan/tender. Saya akan memverifikasi informasi ke sumber resmi.

### 6.4 Footer legal (seluruh app, opsional tapi disarankan)

> PNC Nexus adalah platform jaringan mitra independen. Tidak berafiliasi sebagai portal resmi pemerintah Republik Indonesia.

### 6.5 Framing compliance per modul (Research 8 Sep 2026)

Bukan legal opinion. Ringkas untuk UI:

| Modul | Jangan | Aman |
|-------|--------|------|
| **Kerja** | Klaim agen TK resmi / LPK penyalur / PPTKS / job portal berizin; jamin placement; fee ke pencari kerja | Papan lowongan mitra; perekrutan oleh pemberi kerja |
| **Komoditi** | HET/HPP/SPHP/harga pemerintah; stok nasional; BPOM tanpa bukti | Penawaran mitra; harga indikatif |
| **Pemerintahan** | Tiru LPSE/SPSE; jamin menang; login/upload SPSE di app | Info + dampingan + deep-link INAPROC |

Sumber: `briefs/pnc-nexus-compliance-brief-2026-09-08.md`

---

## 7. Copy UX inti (ID) — cuplikan

| Lokasi | Copy |
|--------|------|
| Hero / landing | Daftar sekali. Tersalurkan ke kerja, komoditi, dan peluang jaringan. |
| CTA daftar | Daftar sebagai mitra |
| Status menunggu | Profil Anda menunggu verifikasi tim. Anda masih bisa melengkapi data. |
| Apply kerja | Kirim minat ke peluang ini |
| Komoditi kosong | Belum ada listing. Buat listing pertama Anda. |
| Pemerintahan kosong | Belum ada info peluang. Pantau halaman ini atau lengkapi profil agar mudah dihubungi operator. |
| Tombol pemerintahan | Minta dampingan (internal) |

---

## 8. Asumsi yang dikunci untuk build (boleh diubah user nanti)

1. **Nama final terkunci:** **PNC Nexus**
2. **MVP terkunci:** tiga jalur tipis (kerja + komoditi + pemerintahan), bukan satu jalur dalam.
3. Apply kerja: **hanya mitra terverifikasi** (rekomendasi keamanan/kualitas lead).
4. Tidak ada pembayaran di MVP.
5. Bahasa UI: Indonesia saja.
6. Cloud Agent belum jalan sampai user setup Origin namespace di https://cursor.com/codebase/get-started — CoS yang relaunch.

---

## 9. Keputusan user

1. ~~Nama final~~ — **PNC Nexus** (terkunci 6 Sep 2026)
2. ~~Prioritas MVP~~ — **tiga jalur tipis** dikunci Product (6 Sep 2026). User bilang lanjutkan; default CoS dipertahankan. Satu jalur diperdalam = post-MVP.

Tidak ada keputusan produk yang blocking build selain infrastruktur Origin/GitHub (milik CoS/user).

---

## 10. Definition of Done MVP

Build dianggap MVP selesai bila semua checkbox §5 tercentang pada environment staging, disclaimer §6.1 muncul di modul pemerintahan, dan admin dapat memverifikasi 1 mitra demo + membuat 1 peluang per jalur + melihatnya di pipeline.

---

## 11. Peta layar MVP (siap handoff)

| Route (usulan) | Peran | Isi wajib |
|----------------|-------|-----------|
| `/` | publik | Landing + CTA daftar/masuk; tagline; 3 pilar singkat |
| `/masuk` `/daftar` | publik | Auth email+password |
| `/onboarding` | mitra baru | Wizard tipe → profil → jalur minat (≥1) |
| `/ringkasan` | semua login | KPI sesuai peran + aktivitas terkini |
| `/profil` | mitra | Edit profil + status verifikasi |
| `/mitra` | operator/admin | Direktori + filter |
| `/kerja` | mitra+ | Daftar peluang; detail; apply (mitra terverifikasi) |
| `/komoditi` | mitra+ | Listing + buat/edit milik sendiri + “tertarik” |
| `/pemerintahan` | mitra+ | **Disclaimer §6.1 di atas**; board info; “minta dampingan” + checkbox §6.3 |
| `/pipeline` | operator/admin | Kanban 5 kolom |
| `/admin` | admin | Approve mitra, CRUD peluang/listing, export CSV |

**Navigasi mitra:** Ringkasan · Kerja · Komoditi · Pemerintahan · Profil  
**Navigasi operator:** + Mitra · Pipeline  
**Navigasi admin:** + Admin

---

## 12. Seed data demo (wajib di staging)

- 1 admin (`admin@pnc.nexus` / password demo terdokumentasi di README)
- 1 operator
- 3 mitra: 1 menunggu, 1 terverifikasi (kerja), 1 terverifikasi (komoditi)
- ≥2 peluang kerja, ≥2 listing komoditi, ≥2 item pemerintahan (semua dengan disclaimer)
- ≥3 kartu pipeline di kolom berbeda

---

## 13. Handoff Cloud Agent (checklist prompt)

Saat GitHub URL / repo siap (Origin Free saat ini blocked), prompt build wajib menyebut:
1. Nama produk **PNC Nexus**
2. File brief ini + paket §14 sebagai sumber kebenaran
3. Demo UI `/workspace/pnc-partner-network/` hanya referensi alur (jangan port HTML statis mentah)
4. Stack: Next.js App Router + TS + Tailwind + shadcn + auth + DB
5. AC §5 harus dicentang; DoD §10; kasus negatif QA (disclaimer hilang / apply tanpa verifikasi / role leak / copy compliance) = fail
6. Bahasa UI Indonesia; disclaimer pemerintahan tidak boleh dihilangkan
7. Compliance UI do-nots §3b + §6.5 (kerja / komoditi / pemerintahan)
8. Tempel `CLOUD_AGENT_PROMPT.md` (self-contained) — **jangan** launch sampai URL repo ada

---

## 14. Daftar dokumen paket

| File | Fungsi |
|------|--------|
| [`README.md`](./README.md) | Indeks paket, urutan baca, status build |
| [`PRODUCT_BRIEF_MVP.md`](./PRODUCT_BRIEF_MVP.md) | Sumber kebenaran produk (file ini) |
| [`CLOUD_AGENT_PROMPT.md`](./CLOUD_AGENT_PROMPT.md) | Prompt paste-ready untuk Cloud Agent |
| [`UX_COPY_DECK.md`](./UX_COPY_DECK.md) | Copy siap pakai per layar |
| [`USER_JOURNEYS.md`](./USER_JOURNEYS.md) | Journey + happy path + edge cases |
| [`QA_ACCEPTANCE.md`](./QA_ACCEPTANCE.md) | Skrip AC, DoD, kasus negatif |
| [`SEED_CONTENT.md`](./SEED_CONTENT.md) | Konten demo siap seed |
| [`INFORMATION_ARCHITECTURE.md`](./INFORMATION_ARCHITECTURE.md) | Sitemap, role×route, entitas |
| [`BRAND_VOICE.md`](./BRAND_VOICE.md) | Tone ID + kata terlarang + compliance |
| [`COMPLIANCE_BRIEF.md`](./COMPLIANCE_BRIEF.md) | Pointer ke Research compliance |
| Compliance Research | `/workspace/briefs/pnc-nexus-compliance-brief-2026-09-08.md` |
