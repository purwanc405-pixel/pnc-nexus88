# Information Architecture — PNC Nexus (MVP)

Sitemap · role × route · model entitas singkat

---

## 1. Sitemap

```
/                     Landing (publik)
/daftar               Registrasi
/masuk                Login
/onboarding           Wizard mitra baru (guard: login, belum selesai)
/ringkasan            Dashboard sesuai peran
/profil               Profil mitra (edit + status)
/mitra                Direktori mitra          [operator, admin]
/kerja                List peluang kerja
/kerja/[id]           Detail + apply
/komoditi             List listing + CTA buat
/komoditi/baru        Form buat                [mitra+]
/komoditi/[id]        Detail + tertarik / edit pemilik
/pemerintahan         List info (+ disclaimer)
/pemerintahan/[id]    Detail + minta dampingan (+ disclaimer)
/pipeline             Kanban 5 kolom           [operator, admin]
/admin                Panel KPI, approve, CRUD, export  [admin]
```

**Nav mitra:** Ringkasan · Kerja · Komoditi · Pemerintahan · Profil  
**Nav operator:** + Mitra · Pipeline  
**Nav admin:** + Admin  

---

## 2. Role × route matrix

| Route | publik | mitra | operator | admin |
|-------|:------:|:-----:|:--------:|:-----:|
| `/` `/masuk` `/daftar` | ✓ | ✓ | ✓ | ✓ |
| `/onboarding` | — | ✓* | — | — |
| `/ringkasan` `/profil` | — | ✓ | ✓ | ✓ |
| `/kerja` `/kerja/[id]` | — | ✓ | ✓ | ✓ |
| Apply kerja (aksi) | — | ✓ hanya `terverifikasi` | — | — |
| `/komoditi` (+CRUD milik) | — | ✓ | ✓ | ✓ |
| `/pemerintahan` (+dampingan) | — | ✓ | ✓ | ✓ |
| `/mitra` | — | — | ✓ | ✓ |
| `/pipeline` | — | — | ✓ | ✓ |
| `/admin` | — | — | —** | ✓ |
| Export CSV | — | — | — | ✓ |
| Approve status mitra | — | — | lihat | ✓ set |

\* Onboarding hanya jika profil belum lengkap.  
\*\* Operator boleh CRUD peluang/listing sesuai brief operasional; panel `/admin` penuh = admin.

**Status mitra memengaruhi aksi (bukan selalu route):**  
`menunggu_verifikasi` | `terverifikasi` | `ditolak` | `ditangguhkan`  
- Apply kerja: hanya `terverifikasi`  
- `ditangguhkan` / `ditolak`: blokir apply kerja & buat listing baru; lihat modul tetap (asumssi journey J6)

---

## 3. Entity model (singkat)

### User
- id, email, passwordHash, role (`mitra`|`operator`|`admin`), createdAt  
- relasi 0..1 MitraProfile

### MitraProfile
- userId, tipe (`individu`|`badan_usaha`), nama, kota, provinsi, wa, deskripsi  
- jalurMinat: `kerja`[] `komoditi` `pemerintahan` (≥1)  
- statusVerifikasi: `menunggu_verifikasi`|`terverifikasi`|`ditolak`|`ditangguhkan`  
- catatanAdmin?, dokumenUrl?, onboardingSelesai, updatedAt

### PeluangKerja
- id, judul, deskripsi, lokasi, jenis, deadline?, status (`buka`|`tutup`)  
- createdByUserId, createdAt, updatedAt

### Aplikasi
- id, peluangKerjaId, mitraProfileId, catatan?, status (`diajukan`|`ditinjau`|`dihubungi`|`diterima_jalur`|`tidak_cocok`)  
- createdAt, updatedAt · **unique** (peluangKerjaId, mitraProfileId)

### ListingKomoditi
- id, mitraProfileId, nama, kategori, volumeText, hargaIndikatif?, labelHarga default “indikatif · penawaran mitra”  
- wilayahAsal, wilayahTujuan, catatan?, status (`draft`|`aktif`|`ditutup`)  
- createdAt, updatedAt

### MinatKomoditi
- id, listingId, mitraProfileId, createdAt · **unique** (listingId, mitraProfileId)

### PeluangPemerintahan
- id, judul, ringkasan, sumberInfoText, tanggal?, status (`aktif`|`arsip`)  
- deepLinkInaproc? (URL eksternal opsional)  
- createdByUserId, createdAt  
- UI selalu overlay disclaimer — bukan field “dismiss”

### Dampingan
- id, peluangPemerintahanId, mitraProfileId, catatan?, checkboxDisclaimerAcceptedAt (wajib)  
- status (`diajukan`|`diproses`|`selesai`), createdAt

### PipelineCard
- id, judul, kolom (`baru`|`ditinjau`|`dihubungi`|`tersalurkan`|`tidak_cocok`)  
- refType + refId (polymorphic longgar: mitra | aplikasi | minat_komoditi | dampingan)  
- updatedAt, updatedByUserId

---

## 4. Relasi (ringkas)

```
User 1──1 MitraProfile
MitraProfile 1──* Aplikasi ──* PeluangKerja
MitraProfile 1──* ListingKomoditi 1──* MinatKomoditi ── MitraProfile
MitraProfile 1──* Dampingan ──* PeluangPemerintahan
PipelineCard ──(ref)→ salah satu entitas di atas
```

---

## 5. Catatan framing produk (IA ↔ compliance)

| Modul | Framing aman di IA/UI |
|-------|------------------------|
| Kerja | Papan lowongan mitra; bukan PPTKS/Job Portal/LPK penyalur |
| Komoditi | Direktori penawaran mitra + minat; bukan harga resmi pemerintah |
| Pemerintahan | Info + dampingan + deep-link INAPROC; bukan SPSE embedded |

---

*Information Architecture · PNC Nexus · 8 September 2026 (WIB)*
