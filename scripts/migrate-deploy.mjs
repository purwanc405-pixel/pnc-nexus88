// Jalankan migrasi Prisma saat build Vercel (vercel-build).
// - Hanya `prisma migrate deploy` (tidak pernah reset / db push --accept-data-loss).
// - Jika DB lama dibuat via `db push` (P3005: schema tidak kosong, belum ada riwayat migrasi),
//   migrasi init ditandai "applied" (baseline) lalu deploy diulang -> hanya migrasi aditif baru yang dijalankan.
// - Gagal => build gagal => deployment produksi lama tetap aktif.
import { spawnSync } from "node:child_process";

const INIT = "20260908000000_init_postgres";

function prisma(args) {
  const r = spawnSync("npx", ["prisma", ...args], { encoding: "utf8" });
  process.stdout.write(r.stdout || "");
  process.stderr.write(r.stderr || "");
  return { code: r.status ?? 1, out: (r.stdout || "") + (r.stderr || "") };
}

if (!process.env.DATABASE_URL) {
  console.warn("[migrate] DATABASE_URL tidak diset — migrasi dilewati.");
  process.exit(0);
}

let r = prisma(["migrate", "deploy"]);
if (r.code !== 0 && r.out.includes("P3005")) {
  console.log(`[migrate] baseline: tandai ${INIT} sebagai applied (DB dibuat via db push).`);
  const b = prisma(["migrate", "resolve", "--applied", INIT]);
  if (b.code !== 0) process.exit(b.code);
  r = prisma(["migrate", "deploy"]);
}
process.exit(r.code);
