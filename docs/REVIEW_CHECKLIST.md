# Review checklist — PNC Nexus MVP (post-commit / PR)

**Kapan dipakai:** begitu worker/CoS push app ke `https://github.com/purwanc405-pixel/pnc-nexus88`  
**Owner review produk:** PNC_Product  
**Sumber:** `PRODUCT_BRIEF_MVP.md` · `QA_ACCEPTANCE.md` · `BRAND_VOICE.md` §8 · compliance Research

Skor: ✅ pass · ⚠️ partial · ❌ fail/blocker · ➖ N/A

---

## 0. Smoke repo
- [ ] README: cara `install` / `dev` / seed / akun demo
- [ ] Stack sesuai: Next.js App Router + TS + Tailwind + shadcn (atau setara terdokumentasi)
- [ ] Seed jalan; `admin@pnc.nexus` (+ operator + 3 mitra) ada
- [ ] Nama UI: **PNC Nexus** (bukan Network Hub)

## 1. Auth & onboarding (AC A)
- [ ] Daftar + login email/password
- [ ] Wizard: tipe, nama, kota/provinsi, WA, deskripsi, upload 1 file opsional
- [ ] Pilih ≥1 jalur: kerja | komoditi | pemerintahan
- [ ] Status awal `menunggu_verifikasi`

## 2. Profil & direktori (AC B)
- [ ] Mitra edit profil
- [ ] Op/Admin filter status + jalur + kota
- [ ] Admin set: menunggu | terverifikasi | ditolak | ditangguhkan

## 3. Kerja (AC C) + compliance
- [ ] CRUD peluang (op/admin)
- [ ] Semua login bisa lihat; **hanya terverifikasi** yang apply
- [ ] Status aplikasi terlihat mitra + inbox op
- [ ] Copy = papan lowongan mitra (bukan agen/LPK/PPTKS/job portal berizin)
- [ ] Tidak ada fee ke pencari kerja
- [ ] Tidak ada klaim “dijamin kerja / 100% placement”

## 4. Komoditi (AC D) + compliance
- [ ] Listing + minat “tertarik”
- [ ] Status draft|aktif|ditutup
- [ ] Harga = indikatif; framing penawaran mitra
- [ ] Tidak ada HET/HPP/SPHP/harga pemerintah / stok nasional / BPOM tanpa bukti

## 5. Pemerintahan (AC E) + compliance — BLOCKER jika gagal
- [ ] Banner disclaimer penuh di setiap view modul (tidak dismiss permanen)
- [ ] Checkbox §6.3 sebelum dampingan
- [ ] Hanya “minta dampingan (internal)” — bukan submit tender
- [ ] Tidak ada UI tiruan LPSE/SPSE / login-upload SPSE
- [ ] CTA “Buka di INAPROC” eksternal bila URL ada
- [ ] Tidak ada klaim jamin menang tender

## 6. Pipeline & admin (AC F–G)
- [ ] Kanban 5 kolom + actor/updated_at
- [ ] Dashboard KPI
- [ ] Export CSV (≥1)
- [ ] UI ID; empty/error state; role guard (mitra tidak akses /admin)

## 7. DoD singkat
- [ ] 1 mitra diverifikasi admin
- [ ] ≥1 item per jalur (kerja, komoditi, pemerintahan)
- [ ] ≥1 kartu pipeline berpindah kolom
- [ ] QA negatif N4–N8 di `QA_ACCEPTANCE.md` dicek

---

## Hasil review (isi saat audit)

| Tanggal | Commit/PR | Reviewer | Ringkas | Blocker |
|---------|-----------|----------|---------|---------|
| | | PNC_Product | | |

**Template verdict:**  
`MVP ACCEPT` / `MVP ACCEPT WITH FIXES` / `MVP REJECT — blockers: …`
