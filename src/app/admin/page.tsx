import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createPeluangKerjaAction,
  createGovAction,
  setMitraStatusAction,
  markNoticeReadAction,
} from "@/lib/actions";
import { FormFlash, PageHeader, StatusBadge, EmptyState } from "@/components/ui";
import { SubmitButton } from "@/components/form-button";
import { operatorMailto, operatorWaLink } from "@/lib/notify";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/masuk");
  if (user.role !== "admin") redirect("/ringkasan");
  const sp = await searchParams;

  const [mitraTotal, mitraVerif, peluangBuka, aplikasi, listingAktif, pending, notices, appsInbox] =
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
      prisma.operatorNotice.findMany({
        where: { readAt: null },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.aplikasi.findMany({
        where: { status: { in: ["diajukan", "ditinjau"] } },
        include: {
          peluang: true,
          user: { include: { mitraProfile: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 8,
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
        <h2 className="font-semibold">Notifikasi operator (stub)</h2>
        <p className="text-xs text-slate-500">
          Email/WA belum dikirim otomatis — gunakan tautan mailto / WA di bawah.
        </p>
        {notices.length === 0 ? (
          <EmptyState title="Tidak ada notifikasi baru." hint="Apply, minat, dan dampingan baru muncul di sini." />
        ) : (
          notices.map((n) => {
            const mail = operatorMailto(n.judul, `${n.detail}\n\n${n.linkPath || ""}`);
            const wa = operatorWaLink(`${n.judul}\n${n.detail}`);
            return (
              <div key={n.id} className="rounded-lg border border-slate-100 p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{n.judul}</p>
                  <span className="badge bg-sky-100 text-sky-800">{n.kind}</span>
                </div>
                <p className="mt-1 text-slate-600">{n.detail}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {n.linkPath ? (
                    <Link href={n.linkPath} className="text-brand-600 hover:underline">
                      Buka
                    </Link>
                  ) : null}
                  <a href={mail} className="text-brand-600 hover:underline">
                    Mailto ops
                  </a>
                  <a href={wa} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">
                    WA ops
                  </a>
                  {n.mitraWa ? (
                    <a
                      href={`https://wa.me/${n.mitraWa.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-600 hover:underline"
                    >
                      WA mitra
                    </a>
                  ) : null}
                  <form action={markNoticeReadAction}>
                    <input type="hidden" name="id" value={n.id} />
                    <SubmitButton className="btn-secondary !py-1 !text-xs">Tandai dibaca</SubmitButton>
                  </form>
                </div>
              </div>
            );
          })
        )}
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold">Antrian verifikasi mitra</h2>
        {pending.length === 0 ? (
          <EmptyState title="Tidak ada yang menunggu." hint="Pendaftar baru muncul di sini." />
        ) : (
          pending.map((m) => (
            <div key={m.id} className="space-y-3 rounded-lg border border-slate-100 p-3">
              <div>
                <p className="font-medium">
                  {m.nama} <StatusBadge status={m.status} />
                </p>
                <p className="text-xs text-slate-500">
                  {m.kota}, {m.provinsi} · {m.user.email} · WA {m.wa}
                </p>
                <p className="mt-1 text-sm text-slate-600">{m.deskripsi}</p>
              </div>
              <form action={setMitraStatusAction} className="space-y-2 rounded-lg bg-slate-50 p-3">
                <input type="hidden" name="profileId" value={m.id} />
                <input type="hidden" name="back" value="/admin" />
                <p className="text-xs font-medium text-slate-700">Checklist verifikasi</p>
                <label className="flex items-start gap-2 text-sm">
                  <input type="checkbox" name="cekProfilLengkap" className="mt-1" />
                  <span>Profil lengkap (nama, lokasi, deskripsi)</span>
                </label>
                <label className="flex items-start gap-2 text-sm">
                  <input type="checkbox" name="cekKontakValid" className="mt-1" />
                  <span>Kontak WA/email masuk akal</span>
                </label>
                <label className="flex items-start gap-2 text-sm">
                  <input type="checkbox" name="cekJalurSesuai" className="mt-1" />
                  <span>Jalur minat sesuai bisnis</span>
                </label>
                <textarea
                  className="input min-h-16 text-sm"
                  name="catatanStatus"
                  placeholder="Catatan approve / alasan reject (wajib jika tolak)"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="submit"
                    name="status"
                    value="terverifikasi"
                    className="btn-primary"
                  >
                    Approve
                  </button>
                  <button type="submit" name="status" value="ditolak" className="btn-danger">
                    Tolak
                  </button>
                </div>
              </form>
            </div>
          ))
        )}
        <Link href="/mitra" className="text-sm text-brand-600 hover:underline">
          Buka direktori mitra →
        </Link>
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold">Aplikasi kerja perlu tindak lanjut</h2>
        {appsInbox.length === 0 ? (
          <p className="text-sm text-slate-500">Tidak ada aplikasi diajukan/ditinjau.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {appsInbox.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 p-3">
                <div>
                  <Link href={`/kerja/${a.peluangId}`} className="font-medium text-brand-700 hover:underline">
                    {a.peluang.judul}
                  </Link>
                  <p className="text-xs text-slate-500">
                    {a.user.mitraProfile?.nama || a.user.name} · <StatusBadge status={a.status} />
                  </p>
                </div>
                <Link href={`/kerja/${a.peluangId}`} className="btn-secondary !py-1 !text-xs">
                  Ubah status
                </Link>
              </li>
            ))}
          </ul>
        )}
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
