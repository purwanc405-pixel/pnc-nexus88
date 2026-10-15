// Jalankan migrasi Prisma saat build Vercel (vercel-build).
// - Hanya `prisma migrate deploy` (tidak pernah reset / db push --accept-data-loss).
// - Neon: migrasi butuh koneksi langsung (bukan pooler/pgbouncer). Jika DIRECT_URL/DATABASE_URL_UNPOOLED
//   tidak diset, host "-pooler" diturunkan menjadi host direct (kredensial sama).
// - DB lama dibuat via `db push` (P3005) -> migrasi init ditandai applied (baseline), lalu deploy diulang.
// - Migrasi notifikasi gagal sebelumnya (P3009) -> ditandai rolled-back lalu diulang (SQL-nya idempoten).
// - Gagal => build gagal => deployment produksi lama tetap aktif.
import { spawnSync } from "node:child_process";

const INIT = "20260908000000_init_postgres";
const NOTIF = "20261015000000_add_notification";

function directUrl() {
  const explicit = process.env.DIRECT_URL || process.env.DATABASE_URL_UNPOOLED || process.env.POSTGRES_URL_NON_POOLING;
  if (explicit) return explicit;
  const raw = process.env.DATABASE_URL;
  try {
    const u = new URL(raw);
    if (u.hostname.includes("-pooler.")) {
      u.hostname = u.hostname.replace("-pooler.", ".");
      u.searchParams.delete("pgbouncer");
      console.log("[migrate] memakai host Neon direct (non-pooler) untuk migrasi.");
      return u.toString();
    }
  } catch {}
  return raw;
}

if (!process.env.DATABASE_URL) {
  console.warn("[migrate] DATABASE_URL tidak diset — migrasi dilewati.");
  process.exit(0);
}
const env = { ...process.env, DATABASE_URL: directUrl() };

function prisma(args) {
  const r = spawnSync("npx", ["prisma", ...args], { encoding: "utf8", env });
  const out = (r.stdout || "") + (r.stderr || "");
  console.log(`[migrate] prisma ${args.join(" ")} -> exit ${r.status}`);
  process.stdout.write(out);
  return { code: r.status ?? 1, out };
}

let r = prisma(["migrate", "deploy"]);
for (let i = 0; i < 3 && r.code !== 0; i++) {
  if (r.out.includes("P3005")) {
    console.log(`[migrate] baseline: tandai ${INIT} sebagai applied (DB dibuat via db push).`);
    const b = prisma(["migrate", "resolve", "--applied", INIT]);
    if (b.code !== 0) break;
  } else if (r.out.includes("P3009") && r.out.includes(NOTIF)) {
    console.log(`[migrate] ${NOTIF} sebelumnya gagal; tandai rolled-back dan ulang (idempoten).`);
    const b = prisma(["migrate", "resolve", "--rolled-back", NOTIF]);
    if (b.code !== 0) break;
  } else if (/advisory lock|P1002|P1001/i.test(r.out)) {
    console.log("[migrate] koneksi/lock bermasalah; ulang tanpa advisory lock.");
    env.PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK = "1";
  } else break;
  r = prisma(["migrate", "deploy"]);
}
if (r.code !== 0) console.error("[migrate] GAGAL — build dihentikan, deployment lama tetap aktif.");
process.exit(r.code);
