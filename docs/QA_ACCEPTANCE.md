# QA & Acceptance — PNC Nexus (MVP)

Skrip uji dari brief §5 · checklist DoD · kasus negatif wajib **FAIL** build  
Seed: pakai `SEED_CONTENT.md`. Copy: `UX_COPY_DECK.md` + compliance Research 8 Sep 2026.

---

## 0. Persiapan staging

| # | Cek |
|---|-----|
| 0.1 | Seed terpasang (admin, operator, 3 mitra, ≥2 peluang/jalur, ≥3 kartu pipeline) |
| 0.2 | UI primer Bahasa Indonesia |
| 0.3 | Akun demo terdokumentasi di README app |
| 0.4 | Mobile lebar ≤375px: nav & form usable (responsif dasar) |

---

## 1. Skrip uji AC

### A. Auth & onboarding
| ID | Langkah | Hasil diharapkan | Pass? |
|----|---------|------------------|-------|
| A1 | Daftar email baru + password ≥8 | Akun dibuat; ke onboarding | ☐ |
| A2 | Logout → login ulang | Masuk sukses | ☐ |
| A3 | Wizard: tipe → profil → ≥1 jalur | Status `menunggu_verifikasi` | ☐ |
| A4 | Skip jalur (0 dipilih) | Validasi; tidak selesai | ☐ |
| A5 | Email duplikat | Error jelas | ☐ |

### B. Profil & direktori
| ID | Langkah | Hasil diharapkan | Pass? |
|----|---------|------------------|-------|
| B1 | Mitra edit profil sendiri | Simpan + toast | ☐ |
| B2 | Operator/Admin filter status+jalur+kota | List terfilter | ☐ |
| B3 | Admin: terverifikasi / ditolak / ditangguhkan | Status & banner mitra update | ☐ |
| B4 | Mitra buka `/mitra` | 403 atau redirect | ☐ |

### C. Jalur Kerja
| ID | Langkah | Hasil diharapkan | Pass? |
|----|---------|------------------|-------|
| C1 | Admin/Ops buat peluang buka | Tampil di `/kerja` | ☐ |
| C2 | Mitra **terverifikasi** apply + catatan | Status diajukan; inbox ops | ☐ |
| C3 | Mitra **menunggu** coba apply | Tombol disabled / blok + helper | ☐ |
| C4 | Mitra lihat status aplikasinya | Status terbaca | ☐ |
| C5 | Copy modul: tidak ada klaim agen TK / LPK penyalur / PPTKS / job portal berizin / jaminan placement / fee pencari kerja | Framing = papan lowongan mitra | ☐ |

### D. Jalur Komoditi
| ID | Langkah | Hasil diharapkan | Pass? |
|----|---------|------------------|-------|
| D1 | Mitra buat listing wajib terisi | Status aktif/draft sesuai pilihan | ☐ |
| D2 | Mitra lain “Saya tertarik” | Antrian minat ops | ☐ |
| D3 | Admin nonaktifkan → `ditutup` | Hilang dari aktif | ☐ |
| D4 | Label harga = **indikatif / penawaran mitra**; tanpa HET/HPP/SPHP/BPOM tanpa bukti | Pass visual + copy | ☐ |

### E. Jalur Pemerintahan
| ID | Langkah | Hasil diharapkan | Pass? |
|----|---------|------------------|-------|
| E1 | Buka list & detail | **Banner disclaimer §6.1 di atas konten** | ☐ |
| E2 | Minta dampingan tanpa centang §6.3 | Tidak submit | ☐ |
| E3 | Centang + kirim | Toast; tercatat internal | ☐ |
| E4 | Tidak ada branding LPSE/SPSE tiruan; tidak ada login/upload SPSE; tidak ada “daftar tender di sini” | Pass | ☐ |
| E5 | Jika ada tautan resmi → deep-link INAPROC eksternal + label jelas | Tab/eksternal sadar user | ☐ |

### F. Pipeline & admin
| ID | Langkah | Hasil diharapkan | Pass? |
|----|---------|------------------|-------|
| F1 | Ops pindah kartu antar 5 kolom | updated_at + actor | ☐ |
| F2 | Admin dashboard KPI | 5 angka brief | ☐ |
| F3 | Export CSV mitra atau aplikasi | File terunduh | ☐ |

### G. UX / role
| ID | Langkah | Hasil diharapkan | Pass? |
|----|---------|------------------|-------|
| G1 | Empty state tiap modul utama | Copy membantu, bukan blank | ☐ |
| G2 | Error 403/404/jaringan | Pesan ID jelas | ☐ |
| G3 | Role guard: mitra ↛ admin/pipeline; publik ↛ ringkasan | Fail = **role leak** | ☐ |

---

## 2. Kasus negatif — wajib FAIL build jika terjadi

| ID | Kondisi | Severitas |
|----|---------|-----------|
| N1 | Disclaimer pemerintahan hilang / bisa di-dismiss permanen di MVP | **BLOCKER** |
| N2 | Apply kerja berhasil tanpa status `terverifikasi` | **BLOCKER** |
| N3 | Role leak (mitra akses admin/pipeline; atau publik akses data mitra sensitif) | **BLOCKER** |
| N4 | UI meniru LPSE/SPSE (logo/form login/upload dokumen tender) | **BLOCKER** |
| N5 | Copy jaminan menang tender / “pengganti SPSE” / “terdaftar LPSE” | **BLOCKER** |
| N6 | Klaim “agen TK resmi” / “LPK penyalur” / “PPTKS” / “job portal berizin Kemnaker” | **BLOCKER** |
| N7 | Fee / biaya penempatan dari pencari kerja di UI | **BLOCKER** |
| N8 | Badge HET/HPP/SPHP/harga pemerintah / stok nasional / BPOM tanpa bukti pada listing | **BLOCKER** |
| N9 | Payment, chat realtime, atau integrasi LPSE API di MVP | **BLOCKER** |
| N10 | UI primer bukan Bahasa Indonesia | **BLOCKER** |

---

## 3. Checklist Definition of Done (brief §10)

- [ ] Semua AC §5 (skrip §1) hijau di staging  
- [ ] Disclaimer §6.1 muncul di setiap view modul pemerintahan  
- [ ] Admin memverifikasi ≥1 mitra demo  
- [ ] ≥1 peluang per jalur (kerja, komoditi, pemerintahan) terlihat user  
- [ ] Pipeline menampilkan pergerakan kartu  
- [ ] README app: cara jalanin + akun demo  
- [ ] Compliance UI do-nots tiga modul lolos §2 (N4–N8)  
- [ ] Tidak ada payment/chat/LPSE integration  

**DoD = semua kotak di atas tercentang.**

---

## 4. Catatan regres singkat post-fix

Ulangi: A3, C2–C3, D4, E1–E4, F1, N1–N3 pada setiap PR besar auth/role/modul.

---

*QA Acceptance · PNC Nexus · 8 September 2026 (WIB)*  
*Compliance: `/workspace/briefs/pnc-nexus-compliance-brief-2026-09-08.md`*
