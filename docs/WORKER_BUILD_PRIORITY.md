# Prioritas build worker (tanpa Cursor Pro)

Repo: `https://github.com/purwanc405-pixel/pnc-nexus88`  
Prompt penuh: `docs/CLOUD_AGENT_PROMPT.md`  
Review: `docs/REVIEW_CHECKLIST.md`

## Urutan wajib (jangan loncat ke kosmetik dulu)

1. Scaffold Next.js App Router + TS + Tailwind + shadcn + auth email/password + DB + roles
2. Onboarding mitra + status `menunggu_verifikasi`
3. Admin: approve/reject mitra + dashboard KPI kasar
4. Modul **Kerja** (list/detail/apply hanya terverifikasi) + disclaimer 1 baris compliance
5. Modul **Komoditi** (listing + tertarik) + framing penawaran mitra
6. Modul **Pemerintahan** (banner disclaimer penuh + dampingan + optional INAPROC link)
7. Pipeline kanban operator + export CSV
8. Seed data (`docs/SEED_CONTENT.md`) + README jalanin
9. QA negatif compliance (fee pencari kerja / HET / tiru LPSE = fail)

## Definition of done worker
Semua item `docs/REVIEW_CHECKLIST.md` §1–7 bisa dijalankan manual di localhost.
