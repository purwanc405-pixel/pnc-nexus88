import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, StatusBadge, Alert } from "@/components/ui";

export default async function RingkasanPage() {
  const user = await getSessionUser();
  if (!user) redirect("/masuk");
  if (user.role === "mitra" && !user.onboardingDone) redirect("/onboarding");

  const [mitraTotal, mitraVerif, peluangBuka, aplikasi, listingAktif] =
    await Promise.all([
      prisma.mitraProfile.count(),
      prisma.mitraProfile.count({ where: { status: "terverifikasi" } }),
      prisma.peluangKerja.count({ where: { status: "buka" } }),
      prisma.aplikasi.count(),
      prisma.listingKomoditi.count({ where: { status: "aktif" } }),
    ]);

  const myApps =
    user.role === "mitra"
      ? await prisma.aplikasi.findMany({
          where: { userId: user.id },
          include: { peluang: true },
          orderBy: { createdAt: "desc" },
          take: 5,
        })
      : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ringkasan"
        subtitle={`Selamat datang, ${user.name}.`}
      />

      {user.role === "mitra" && user.mitraStatus === "menunggu_verifikasi" ? (
        <Alert tone="warn">
          Profil Anda menunggu verifikasi tim. Anda masih bisa melengkapi data dan
          melihat peluang. Kirim minat kerja hanya setelah terverifikasi.
        </Alert>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ["Total mitra", mitraTotal],
          ["Terverifikasi", mitraVerif],
          ["Peluang terbuka", peluangBuka],
          ["Aplikasi", aplikasi],
          ["Listing aktif", listingAktif],
        ].map(([label, val]) => (
          <div key={String(label)} className="card">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-bold">{val}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/kerja" className="card hover:border-brand-300">
          <h2 className="font-semibold text-brand-700">Kerja</h2>
          <p className="mt-1 text-sm text-slate-600">Papan lowongan mitra</p>
        </Link>
        <Link href="/komoditi" className="card hover:border-brand-300">
          <h2 className="font-semibold text-brand-700">Komoditi</h2>
          <p className="mt-1 text-sm text-slate-600">Penawaran mitra</p>
        </Link>
        <Link href="/pemerintahan" className="card hover:border-brand-300">
          <h2 className="font-semibold text-brand-700">Pemerintahan</h2>
          <p className="mt-1 text-sm text-slate-600">Info & dampingan internal</p>
        </Link>
      </div>

      {user.role === "mitra" ? (
        <div className="card">
          <h2 className="font-semibold">Aktivitas aplikasi saya</h2>
          {myApps.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">Belum ada aplikasi.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {myApps.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <Link href={`/kerja/${a.peluangId}`} className="text-brand-700 hover:underline">
                    {a.peluang.judul}
                  </Link>
                  <StatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
