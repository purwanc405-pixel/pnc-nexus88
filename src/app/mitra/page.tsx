import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { setMitraStatusAction } from "@/lib/actions";
import { PageHeader, StatusBadge, EmptyState, FormFlash } from "@/components/ui";
import { SubmitButton } from "@/components/form-button";

export default async function MitraDirPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; kota?: string; jalur?: string; error?: string; ok?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/masuk");
  if (user.role !== "admin" && user.role !== "operator") redirect("/ringkasan");

  const sp = await searchParams;
  const where: Record<string, unknown> = {};
  if (sp.status) where.status = sp.status;
  if (sp.kota) where.kota = { contains: sp.kota };
  if (sp.jalur === "kerja") where.jalurKerja = true;
  if (sp.jalur === "komoditi") where.jalurKomoditi = true;
  if (sp.jalur === "pemerintahan") where.jalurPemerintahan = true;

  const list = await prisma.mitraProfile.findMany({
    where,
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <PageHeader title="Direktori mitra" subtitle="Filter status, jalur, dan kota." />
      <FormFlash error={sp.error} ok={sp.ok} />
      <form className="card grid gap-3 sm:grid-cols-4" method="get">
        <select className="input" name="status" defaultValue={sp.status || ""}>
          <option value="">Semua status</option>
          <option value="menunggu_verifikasi">Menunggu</option>
          <option value="terverifikasi">Terverifikasi</option>
          <option value="ditolak">Ditolak</option>
          <option value="ditangguhkan">Ditangguhkan</option>
        </select>
        <select className="input" name="jalur" defaultValue={sp.jalur || ""}>
          <option value="">Semua jalur</option>
          <option value="kerja">Kerja</option>
          <option value="komoditi">Komoditi</option>
          <option value="pemerintahan">Pemerintahan</option>
        </select>
        <input className="input" name="kota" placeholder="Kota" defaultValue={sp.kota || ""} />
        <button className="btn-secondary" type="submit">Terapkan filter</button>
      </form>

      {list.length === 0 ? (
        <EmptyState title="Tidak ada mitra." hint="Ubah filter atau tunggu pendaftar baru." />
      ) : (
        <div className="space-y-3">
          {list.map((m) => (
            <div key={m.id} className="card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold">{m.nama}</h2>
                  <StatusBadge status={m.status} />
                </div>
                <p className="text-sm text-slate-600">
                  {m.tipe} · {m.kota}, {m.provinsi} · {m.user.email} · WA {m.wa}
                </p>
                <p className="text-xs text-slate-500">
                  Jalur: {[m.jalurKerja && "kerja", m.jalurKomoditi && "komoditi", m.jalurPemerintahan && "pemerintahan"].filter(Boolean).join(", ")}
                </p>
              </div>
              {user.role === "admin" ? (
                <form action={setMitraStatusAction} className="flex flex-wrap items-center gap-2">
                  <input type="hidden" name="profileId" value={m.id} />
                  <select className="input !w-auto" name="status" defaultValue={m.status}>
                    <option value="menunggu_verifikasi">menunggu_verifikasi</option>
                    <option value="terverifikasi">terverifikasi</option>
                    <option value="ditolak">ditolak</option>
                    <option value="ditangguhkan">ditangguhkan</option>
                  </select>
                  <SubmitButton className="btn-primary">Set status</SubmitButton>
                </form>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
