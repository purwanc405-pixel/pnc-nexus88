# AC — Fix production PNC Nexus (Neon)

**Masalah:** login live gagal (server digest); SQLite file tidak cocok Vercel serverless.  
**Keputusan Product (8 Sep 2026):** pakai **Neon Postgres gratis** (Turso = fallback).

## Acceptance
- [ ] `https://pnc-nexus88.vercel.app/masuk` login demo sukses (`rina.kerja@demo.nexus` / seed password README)
- [ ] `/pemerintahan` menampilkan banner penuh: “Informasi bukan portal resmi”, “bukan LPSE/SPSE”, “Tidak ada jaminan menang tender”
- [ ] Detail pemerintahan: checkbox + “Minta dampingan (internal)”; CTA INAPROC eksternal bila ada
- [ ] Landing tetap: tagline, 3 pilar framing aman, footer independen
- [ ] Seed akun demo tetap terdokumentasi di README
- [ ] Tidak ada regresi compliance (fee pencari kerja / HET / tiru LPSE)

## Out of scope fix ini
Fitur baru besar; fokus auth+DB+seed+redeploy.
