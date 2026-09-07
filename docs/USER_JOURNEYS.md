# User Journeys — PNC Nexus (MVP)

7 journey inti · langkah · happy path · edge cases  
Selaras brief §5, copy deck, dan role matrix IA.

---

## J1 — Mitra daftar → verifikasi → apply kerja

**Aktor:** Mitra baru → Admin → Mitra terverifikasi  
**Tujuan:** Akun aktif, profil terverifikasi, minat kerja terkirim.

### Langkah
1. Publik buka `/` → **Daftar sebagai mitra**
2. Isi email + password → akun dibuat → redirect `/onboarding`
3. Pilih tipe (individu/badan) → isi nama, kota/provinsi, WA, deskripsi, dokumen opsional
4. Pilih ≥1 jalur (sertakan **kerja**) → selesai → status `menunggu_verifikasi`
5. Mitra bisa lihat `/kerja` tetapi tombol apply **disabled**
6. Admin di `/admin` atau `/mitra` set status → `terverifikasi`
7. Mitra buka detail peluang → **Kirim minat** + catatan → status aplikasi `diajukan`
8. Operator melihat inbox aplikasi; mitra melihat status di detail/ringkasan

### Happy path
Profil lengkap dalam 1 sesi · admin approve ≤ 3 hari kerja · apply sukses · toast konfirmasi.

### Edge cases
| Kasus | Perilaku diharapkan |
|-------|---------------------|
| Email sudah terdaftar | Error; arahkan ke masuk |
| Onboarding ditinggal di tengah | Saat login ulang, lanjut wizard sampai selesai |
| Apply saat masih menunggu | Tombol disabled + helper verifikasi |
| Peluang ditutup | Tidak bisa apply; badge Ditutup |
| Sudah pernah apply peluang sama | Tombol “Minat sudah dikirim”; tidak dobel |
| Mitra ditolak sebelum apply | Tidak bisa apply; banner status ditolak di profil |

---

## J2 — Mitra listing komoditi + minat dari mitra lain

**Aktor:** Mitra A (supplier) · Mitra B · Operator  
**Tujuan:** Listing aktif; minat masuk antrian operator.

### Langkah
1. Mitra A (disarankan terverifikasi; MVP boleh buat listing jika login + onboarding selesai — **asumsi: login + onboarding cukup untuk buat listing**) buka `/komoditi` → **Buat listing**
2. Isi nama, kategori, volume/unit, harga indikatif opsional, asal/tujuan, catatan → status `aktif`
3. Mitra B melihat listing → **Saya tertarik**
4. Operator melihat antrian minat; dapat buat/hubungkan kartu pipeline

### Happy path
Listing tampil di list aktif · minat tercatat sekali per mitra per listing · operator tindak lanjut.

### Edge cases
| Kasus | Perilaku |
|-------|----------|
| Field wajib kosong | Validasi inline; tidak simpan |
| Listing `draft` | Hanya terlihat pemilik (+ admin); belum bisa “tertarik” publik |
| Listing `ditutup` / dinonaktifkan admin | Tidak di list aktif; minat baru ditolak |
| Tertarik pada listing sendiri | Blokir / sembunyikan tombol |
| Dobel “tertarik” | Idempotent; toast “Minat sudah tercatat” |

---

## J3 — Mitra minta dampingan pemerintahan

**Aktor:** Mitra · Operator  
**Tujuan:** Permintaan dampingan internal tercatat dengan disclaimer terpenuhi.

### Langkah
1. Mitra buka `/pemerintahan` — **banner disclaimer §6.1 terlihat di atas**
2. Buka detail item → baca ringkasan + sumber info
3. Klik **Minta dampingan (internal)**
4. Centang checkbox §6.3 + isi catatan → kirim
5. Operator melihat permintaan; opsional kartu pipeline kolom Baru

### Happy path
Disclaimer selalu tampak · checkbox wajib · toast sukses · tidak ada CTA “daftar LPSE”.

### Edge cases
| Kasus | Perilaku |
|-------|----------|
| Checkbox tidak dicentang | Tidak submit; validasi |
| Disclaimer dihilangkan (bug) | **Fail AC** — lihat QA |
| Mitra mengunggah “dokumen rahasia” di catatan | Copy melarang; MVP: teks saja, tanpa upload khusus modul ini |
| Item pemerintahan diarsipkan | Detail read-only; tombol dampingan nonaktif |

---

## J4 — Operator match & geser pipeline

**Aktor:** Operator (atau Admin)  
**Tujuan:** Kartu bergerak Baru → … → Tersalurkan / Tidak cocok; jejak waktu + aktor.

### Langkah
1. Login operator → `/pipeline`
2. Lihat kartu dari mitra baru / aplikasi / minat komoditi / dampingan
3. Drag atau aksi pindah kolom: Baru → Ditinjau → Dihubungi → Tersalurkan **atau** Tidak cocok
4. `updated_at` + actor tersimpan; toast konfirmasi

### Happy path
Minimal 3 kartu di kolom berbeda (seed) · pindah lancar · filter opsional by jalur.

### Edge cases
| Kasus | Perilaku |
|-------|----------|
| Mitra role buka `/pipeline` | 403 / redirect |
| Pindah ke kolom sama | No-op |
| Kartu mitra yang ditangguhkan | Tetap terlihat operator; label status mitra jelas |
| Konflik edit bersamaan | Last-write-wins + updated_at; cukup untuk MVP |

---

## J5 — Admin approve mitra + CRUD konten + export

**Aktor:** Admin  
**Tujuan:** Verifikasi mitra; kelola peluang/listing/item; unduh CSV.

### Langkah
1. `/admin` atau `/mitra` → filter `menunggu_verifikasi` → **Setujui** / **Tolak** (+ catatan) / **Tangguhkan**
2. CRUD: buat peluang kerja, listing (atau moderasi), item pemerintahan (disclaimer tetap di UI publik)
3. Dashboard KPI terbarui
4. Export CSV mitra **atau** aplikasi (minimal satu)

### Happy path
1 mitra demo diverifikasi · 1 peluang per jalur · KPI angka masuk akal · CSV terunduh.

### Edge cases
| Kasus | Perilaku |
|-------|----------|
| Tolak tanpa catatan | Wajibkan catatan |
| Hapus peluang yang sudah ada aplikasi | Soft-close (`ditutup`) lebih disarankan daripada hard delete |
| Operator coba akses tab admin penuh | Sesuai matrix: operator CRUD peluang boleh; export & approve — ikut brief (admin approve; operator boleh bantu review) |
| Export kosong | CSV header saja + pesan “tidak ada baris” |

---

## J6 — Mitra ditolak atau ditangguhkan

**Aktor:** Admin · Mitra terdampak  
**Tujuan:** Status jelas; apply diblokir; komunikasi via banner (bukan chat).

### Langkah
1. Admin set `ditolak` atau `ditangguhkan` + catatan
2. Mitra login → banner di `/profil` & `/ringkasan`
3. Apply kerja disabled; minat dampingan: **MVP default = masih boleh minta dampingan info** kecuali admin tangguhkan total akses (catat di seed: tangguhkan = blokir apply kerja; modul lain read-only + dampingan opsional — **asumsi terkunci: tangguhkan memblokir apply kerja & buat listing baru; lihat tetap boleh**)
4. Mitra perbarui profil; admin bisa ubah kembali ke `terverifikasi` atau biarkan

### Happy path
Tidak ada apply dari akun ditolak/ditangguhkan · copy tidak menghina · jalur klarifikasi = “hubungi tim” (teks).

### Edge cases
| Kasus | Perilaku |
|-------|----------|
| Aplikasi kerja yang sudah diajukan sebelum ditangguhkan | Tetap di inbox operator dengan flag status mitra |
| Ditolak lalu daftar email baru | Diizinkan teknis; proses verifikasi manual menangkap duplikasi |

---

## J7 — Mitra onboarding multi-jalur lalu jelajah ketiga modul

**Aktor:** Mitra terverifikasi dengan minat kerja + komoditi + pemerintahan  
**Tujuan:** Satu akun memakai ketiga jalur tipis tanpa bingung nav.

### Langkah
1. Onboarding centang ketiga jalur
2. `/ringkasan` menampilkan CTA ketiga modul
3. Apply 1 kerja · buat 1 listing · minta 1 dampingan (dengan disclaimer)
4. Nav mitra konsisten: Ringkasan · Kerja · Komoditi · Pemerintahan · Profil

### Happy path
Tidak ada dead-end · empty state membantu · bahasa ID konsisten.

### Edge cases
| Kasus | Perilaku |
|-------|----------|
| User hapus semua jalur minat di profil | Validasi: minimal 1 jalur |
| Deep link ke `/admin` | 403 |

---

## Ringkasan pemetaan AC

| Journey | AC brief terkait |
|---------|------------------|
| J1 | A, B, C |
| J2 | D |
| J3 | E |
| J4 | F (pipeline) |
| J5 | B, F, G |
| J6 | B, C (negatif) |
| J7 | G + lintas modul |

---

*User Journeys · PNC Nexus · 8 September 2026 (WIB)*
