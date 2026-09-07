# AC — Fix production PNC Nexus (Neon)

**Masalah:** login live gagal (SQLite di Vercel).  
**Keputusan:** Neon Postgres gratis.

## Hasil verifikasi Product (8 Sep 2026 WIB)

| Item | Hasil |
|------|-------|
| Login demo rina | **PASS** → `/ringkasan` |
| Banner `/pemerintahan` frasa wajib | **PASS** |
| Detail tanpa SPSE login/upload | **PASS** |
| Landing/footer (sebelumnya) | **PASS** |
| **Verdict** | **PROD FIX PASS** |

URL: https://pnc-nexus88.vercel.app  
Password seed: lihat README (`NexusDemo2026!`)
