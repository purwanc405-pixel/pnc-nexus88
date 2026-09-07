import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const rows = await prisma.aplikasi.findMany({
    include: {
      user: { include: { mitraProfile: true } },
      peluang: true,
    },
    orderBy: { createdAt: "desc" },
  });
  const header = [
    "peluang",
    "mitra",
    "email",
    "status",
    "catatan",
    "diajukan_at",
  ];
  const lines = [
    header.join(","),
    ...rows.map((r) =>
      [
        r.peluang.judul,
        r.user.mitraProfile?.nama || r.user.name,
        r.user.email,
        r.status,
        r.catatan,
        r.createdAt.toISOString(),
      ]
        .map((v) => `"${String(v).replaceAll('"', '""')}"`)
        .join(",")
    ),
  ];
  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="aplikasi.csv"',
    },
  });
}
