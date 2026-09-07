import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createPeluangKerjaAction,
  createGovAction,
  setMitraStatusAction,
} from "@/lib/actions";
import { FormFlash, PageHeader, StatusBadge } from "@/components/ui";
import { SubmitButton } from "@/components/form-button";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/masuk");
  if (user.role !== "admin") redirect("/ringkasan");
  const sp = await searchParams;

  const [mitraTotal, mitraVerif, peluangBuka, aplikasi, listingAktif, pending] =
    await Promise.all([
      prisma.mitraProfile.count(),
      prisma.mitraProfile.count({ where: { status: "terverifikasi" } }),
      prisma.peluangKerja.count({ where: { status: "buka" } }),
      prisma.aplikasi.count(),
      prisma.listingKomoditi.count({ where: { status: "aktif" } }),
      prisma.mitraProfile.findMany({
        where: { status: "menunggu_verifikasi" },
        include: { user: true },
        take: 10,
      }),
    ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin"
        subtitle="Approve mitra, CRUD peluang, KPI, dan export CSV."
        actions={
          <div className="flex flex-wrap gap-2">
            <a href="/api/export/mitra" className="btn-secondary">
              Export CSV mitra
            </a>
            <a href="/api/export/aplikasi" className="btn-secondary">
              Export CSV aplikasi
            </a>
          </div>
        }
      />

      <FormFlash error={sp.error} ok={sp.ok} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ["Total mitra", mitraTotal],
          ["Terverifikasi", mitraVerif],
          ["Peluang terbuka", peluangBuka],
          ["Aplikasi masuk", aplikasi],
          ["Listing aktif", listingAktif],
        ].map(([l, v]) => (
          <div key={String(l)} className="card">
            <p className="text-xs text-slate-500">{l}</p>
            <p className="text-2xl font-bold">{v}</p>
          </div>
        ))}
      </div>

      <section className="card space-y-3">
        <h2 className="font-semibold">Antrian verifikasi mitra</h2>
        {pending.length === 0 ? (
          <p className="text-sm text-slate-500">Tidak ada yang menunggu.</p>
        ) : (
          pending.map((m) => (
            <div
              key={m.id}
              className="flex flex-col gap-2 rounded-lg border border-slate-100 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">
                  {m.nama} <StatusBadge status={m.status} />
                </p>
                <p className="text-xs text-slate-500">
                  {m.kota}, {m.provinsi} · {m.user.email}
                </p>
              </div>
              <form action={setMitraStatusAction} className="flex gap-2">
                <input type="hidden" name="profileId" value={m.id} />
                <input type="hidden" name="status" value="terverifikasi" />
                <SubmitButton>Approve</SubmitButton>
              </form>
              <form action={setMitraStatusAction} className="flex gap-2">
                <input type="hidden" name="profileId" value={m.id} />
                <input type="hidden" name="status" value="ditolak" />
                <SubmitButton className="btn-danger">Tolak</SubmitButton>
              </form>
            </div>
          ))
        )}
        <Link href="/mitra" className="text-sm text-brand-600 hover:underline">
          Buka direktori mitra →
        </Link>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <form action={createPeluangKerjaAction} className="card space-y-3">
          <h2 className="font-semibold">Tambah peluang kerja</h2>
          <input className="input" name="judul" placeholder="Judul" required />
          <input className="input" name="jenis" placeholder="Jenis" required />
          <input className="input" name="lokasi" placeholder="Lokasi" required />
          <input className="input" name="deadline" type="date" />
          <textarea className="input min-h-20" name="deskripsi" placeholder="Deskripsi" required />
          <SubmitButton>Simpan peluang</SubmitButton>
        </form>

        <form action={createGovAction} className="card space-y-3">
          <h2 className="font-semibold">Tambah info pemerintahan</h2>
          <input className="input" name="judul" placeholder="Judul" required />
          <textarea className="input min-h-20" name="ringkasan" placeholder="Ringkasan" required />
          <input className="input" name="sumberInfo" placeholder="Sumber info (teks)" required />
          <input className="input" name="tanggal" type="date" required />
          <input className="input" name="inaprocUrl" placeholder="URL INAPROC opsional" />
          <SubmitButton>Simpan info</SubmitButton>
        </form>
      </div>
    </div>
  );
}
