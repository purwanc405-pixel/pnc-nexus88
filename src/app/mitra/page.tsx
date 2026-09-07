import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { setMitraStatusAction } from "@/lib/actions";
import { PageHeader, StatusBadge, EmptyState, FormFlash } from "@/components/ui";
import { SubmitButton } from "@/components/form-button";
import type { Prisma } from "@prisma/client";

export default async function MitraDirPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    kota?: string;
    jalur?: string;
    q?: string;
    error?: string;
    ok?: string;
  }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/masuk");
  if (user.role !== "admin" && user.role !== "operator") redirect("/ringkasan");

  const sp = await searchParams;
  const where: Prisma.MitraProfileWhereInput = {};
  if (sp.status) where.status = sp.status as Prisma.EnumMitraStatusFilter["equals"];
  if (sp.kota) where.kota = { contains: sp.kota };
  if (sp.jalur === "kerja") where.jalurKerja = true;
  if (sp.jalur === "komoditi") where.jalurKomoditi = true;
  if (sp.jalur === "pemerintahan") where.jalurPemerintahan = true;
  if (sp.q?.trim()) {
    const q = sp.q.trim();
    where.OR = [
      { nama: { contains: q } },
      { kota: { contains: q } },
      { provinsi: { contains: q } },
      { deskripsi: { contains: q } },
      { wa: { contains: q } },
      { user: { email: { contains: q } } },
    ];
  }

  const list = await prisma.mitraProfile.findMany({
    where,
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <PageHeader title="Direktori mitra" subtitle="Filter status, jalur, kota, dan pencarian bebas." />
      <FormFlash error={sp.error} ok={sp.ok} />
      <form className="card grid gap-3 sm:grid-cols-5" method="get">
        <input className="input sm:col-span-2" name="q" placeholder="Cari nama / email / WA" defaultValue={sp.q || ""} />
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
        <div className="flex gap-2">
          <input className="input" name="kota" placeholder="Kota" defaultValue={sp.kota || ""} />
          <button className="btn-secondary shrink-0" type="submit">
            Filter
          </button>
        </div>
      </form>

      {list.length === 0 ? (
        <EmptyState title="Tidak ada mitra." hint="Ubah filter atau tunggu pendaftar baru." />
      ) : (
        <div className="space-y-3">
          {list.map((m) => (
            <div key={m.id} className="card space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold">{m.nama}</h2>
                    <StatusBadge status={m.status} />
                  </div>
                  <p className="text-sm text-slate-600">
                    {m.tipe} · {m.kota}, {m.provinsi} · {m.user.email} · WA {m.wa}
                  </p>
                  <p className="text-xs text-slate-500">
                    Jalur:{" "}
                    {[
                      m.jalurKerja && "kerja",
                      m.jalurKomoditi && "komoditi",
                      m.jalurPemerintahan && "pemerintahan",
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  {m.catatanStatus ? (
                    <p className="mt-1 text-xs text-slate-600">Catatan: {m.catatanStatus}</p>
                  ) : null}
                </div>
              </div>
              {user.role === "admin" ? (
                <form action={setMitraStatusAction} className="space-y-2 rounded-lg bg-slate-50 p-3">
                  <input type="hidden" name="profileId" value={m.id} />
                  <input type="hidden" name="back" value="/mitra" />
                  <p className="text-xs font-medium text-slate-700">Checklist + status</p>
                  <label className="flex items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="cekProfilLengkap"
                      className="mt-1"
                      defaultChecked={m.cekProfilLengkap}
                    />
                    <span>Profil lengkap</span>
                  </label>
                  <label className="flex items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="cekKontakValid"
                      className="mt-1"
                      defaultChecked={m.cekKontakValid}
                    />
                    <span>Kontak valid</span>
                  </label>
                  <label className="flex items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="cekJalurSesuai"
                      className="mt-1"
                      defaultChecked={m.cekJalurSesuai}
                    />
                    <span>Jalur sesuai</span>
                  </label>
                  <textarea
                    className="input min-h-14 text-sm"
                    name="catatanStatus"
                    defaultValue={m.catatanStatus || ""}
                    placeholder="Catatan / alasan reject (wajib jika ditolak)"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <select className="input !w-auto" name="status" defaultValue={m.status}>
                      <option value="menunggu_verifikasi">menunggu_verifikasi</option>
                      <option value="terverifikasi">terverifikasi</option>
                      <option value="ditolak">ditolak</option>
                      <option value="ditangguhkan">ditangguhkan</option>
                    </select>
                    <SubmitButton className="btn-primary">Set status</SubmitButton>
                  </div>
                </form>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
