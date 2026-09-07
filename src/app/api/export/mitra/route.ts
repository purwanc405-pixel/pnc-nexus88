import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const rows = await prisma.mitraProfile.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });
  const header = [
    "nama",
    "email",
    "tipe",
    "kota",
    "provinsi",
    "wa",
    "status",
    "jalur_kerja",
    "jalur_komoditi",
    "jalur_pemerintahan",
  ];
  const lines = [
    header.join(","),
    ...rows.map((r) =>
      [
        r.nama,
        r.user.email,
        r.tipe,
        r.kota,
        r.provinsi,
        r.wa,
        r.status,
        r.jalurKerja,
        r.jalurKomoditi,
        r.jalurPemerintahan,
      ]
        .map((v) => `"${String(v).replaceAll('"', '""')}"`)
        .join(",")
    ),
  ];
  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="mitra.csv"',
    },
  });
}
