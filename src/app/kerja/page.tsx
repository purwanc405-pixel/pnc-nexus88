import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, StatusBadge, EmptyState, FormFlash } from "@/components/ui";
import { KerjaDisclaimer } from "@/components/disclaimers";
import type { Prisma } from "@prisma/client";

export default async function KerjaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; lokasi?: string; error?: string; ok?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/masuk");
  if (user.role === "mitra" && !user.onboardingDone) redirect("/onboarding");
  const sp = await searchParams;

  const where: Prisma.PeluangKerjaWhereInput = {};
  if (sp.status === "buka" || sp.status === "tutup") where.status = sp.status;
  if (sp.lokasi?.trim()) where.lokasi = { contains: sp.lokasi.trim() };
  if (sp.q?.trim()) {
    const q = sp.q.trim();
    where.OR = [
      { judul: { contains: q } },
      { deskripsi: { contains: q } },
      { jenis: { contains: q } },
      { lokasi: { contains: q } },
    ];
  }

  const list = await prisma.peluangKerja.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Kerja"
        subtitle="Papan lowongan mitra — lihat peluang dan kirim minat jika terverifikasi."
      />
      <KerjaDisclaimer />
      <FormFlash error={sp.error} ok={sp.ok} />
      <form className="card grid gap-3 sm:grid-cols-4" method="get">
        <input
          className="input sm:col-span-2"
          name="q"
          placeholder="Cari judul / jenis / lokasi"
          defaultValue={sp.q || ""}
        />
        <select className="input" name="status" defaultValue={sp.status || ""}>
          <option value="">Semua status</option>
          <option value="buka">Buka</option>
          <option value="tutup">Tutup</option>
        </select>
        <div className="flex gap-2">
          <input className="input" name="lokasi" placeholder="Filter lokasi" defaultValue={sp.lokasi || ""} />
          <button className="btn-secondary shrink-0" type="submit">
            Filter
          </button>
        </div>
      </form>
      {list.length === 0 ? (
        <EmptyState
          title="Belum ada peluang yang cocok."
          hint="Ubah filter, atau lengkapi profil agar operator mudah mencocokkan Anda."
        />
      ) : (
        <div className="grid gap-3">
          {list.map((p) => (
            <Link key={p.id} href={`/kerja/${p.id}`} className="card hover:border-brand-300">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-semibold text-brand-800">{p.judul}</h2>
                <StatusBadge status={p.status} />
              </div>
              <p className="mt-1 text-sm text-slate-600">
                {p.jenis} · {p.lokasi}
                {p.deadline
                  ? ` · Deadline ${p.deadline.toLocaleDateString("id-ID")}`
                  : ""}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
