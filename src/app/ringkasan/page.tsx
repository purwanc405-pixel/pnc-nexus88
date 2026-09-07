import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, StatusBadge, Alert, FormFlash, EmptyState } from "@/components/ui";
import { markNoticeReadAction } from "@/lib/actions";
import { SubmitButton } from "@/components/form-button";
import { operatorMailto, operatorWaLink } from "@/lib/notify";

export default async function RingkasanPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/masuk");
  if (user.role === "mitra" && !user.onboardingDone) redirect("/onboarding");
  const sp = await searchParams;

  const isOps = user.role === "admin" || user.role === "operator";

  const [mitraTotal, mitraVerif, peluangBuka, aplikasi, listingAktif, profile, notices] =
    await Promise.all([
      prisma.mitraProfile.count(),
      prisma.mitraProfile.count({ where: { status: "terverifikasi" } }),
      prisma.peluangKerja.count({ where: { status: "buka" } }),
      prisma.aplikasi.count(),
      prisma.listingKomoditi.count({ where: { status: "aktif" } }),
      user.role === "mitra"
        ? prisma.mitraProfile.findUnique({ where: { userId: user.id } })
        : Promise.resolve(null),
      isOps
        ? prisma.operatorNotice.findMany({
            where: { readAt: null },
            orderBy: { createdAt: "desc" },
            take: 5,
          })
        : Promise.resolve([]),
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

  const pathwayCards = [
    {
      href: "/kerja",
      title: "Kerja",
      desc: "Lihat papan lowongan & kirim minat",
      show: !profile || profile.jalurKerja || isOps,
      cta: user.mitraStatus === "terverifikasi" ? "Buka peluang kerja" : "Jelajahi peluang",
    },
    {
      href: "/komoditi",
      title: "Komoditi",
      desc: "Listing & minat penawaran mitra",
      show: !profile || profile.jalurKomoditi || isOps,
      cta: "Buka pasar komoditi",
    },
    {
      href: "/pemerintahan",
      title: "Pemerintahan",
      desc: "Info + dampingan internal (bukan LPSE)",
      show: !profile || profile.jalurPemerintahan || isOps,
      cta: "Lihat info dampingan",
    },
  ].filter((c) => c.show);

  return (
    <div className="space-y-6">
      <PageHeader title="Ringkasan" subtitle={`Selamat datang, ${user.name}.`} />
      <FormFlash error={sp.error} ok={sp.ok} />

      {user.role === "mitra" && user.mitraStatus === "menunggu_verifikasi" ? (
        <Alert tone="warn">
          <p className="font-semibold">Menunggu verifikasi</p>
          <p className="mt-1">
            Tim masih meninjau profil Anda. Anda bisa melengkapi data dan melihat peluang.
            Kirim minat kerja / buat listing hanya setelah status terverifikasi.
          </p>
          <p className="mt-2">
            <Link href="/profil" className="font-medium underline">
              Lengkapi profil
            </Link>
            {" · "}
            <Link href="/kerja" className="font-medium underline">
              Lihat peluang kerja
            </Link>
          </p>
        </Alert>
      ) : null}

      {user.role === "mitra" && user.mitraStatus === "ditolak" ? (
        <Alert tone="danger">
          Profil ditolak
          {profile?.catatanStatus ? `: ${profile.catatanStatus}` : "."} Hubungi operator
          jika perlu klarifikasi.
        </Alert>
      ) : null}

      {user.role === "mitra" && user.mitraStatus === "ditangguhkan" ? (
        <Alert tone="warn">
          Akun ditangguhkan sementara. Fitur kirim minat / listing baru dinonaktifkan.
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

      <div>
        <h2 className="mb-3 font-semibold text-slate-800">Lanjut sesuai jalur Anda</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {pathwayCards.map((c) => (
            <Link key={c.href} href={c.href} className="card hover:border-brand-300">
              <h3 className="font-semibold text-brand-700">{c.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{c.desc}</p>
              <p className="mt-3 text-sm font-medium text-brand-600">{c.cta} →</p>
            </Link>
          ))}
        </div>
      </div>

      {isOps ? (
        <div className="card space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold">Inbox notifikasi operator</h2>
            {user.role === "admin" ? (
              <Link href="/admin" className="text-sm text-brand-600 hover:underline">
                Panel admin →
              </Link>
            ) : null}
          </div>
          {notices.length === 0 ? (
            <EmptyState
              title="Belum ada minat baru."
              hint="Apply kerja, minat komoditi, dan dampingan akan muncul di sini."
            />
          ) : (
            notices.map((n) => (
              <div key={n.id} className="rounded-lg border border-slate-100 p-3 text-sm">
                <p className="font-medium">{n.judul}</p>
                <p className="mt-1 text-slate-600">{n.detail}</p>
                <div className="mt-2 flex flex-wrap gap-3">
                  {n.linkPath ? (
                    <Link href={n.linkPath} className="text-brand-600 hover:underline">
                      Buka
                    </Link>
                  ) : null}
                  <a href={operatorMailto(n.judul, n.detail)} className="text-brand-600 hover:underline">
                    Mailto
                  </a>
                  <a
                    href={operatorWaLink(`${n.judul}\n${n.detail}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-600 hover:underline"
                  >
                    WA
                  </a>
                  <form action={markNoticeReadAction}>
                    <input type="hidden" name="id" value={n.id} />
                    <SubmitButton className="btn-secondary !py-1 !text-xs">Dibaca</SubmitButton>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      ) : null}

      {user.role === "mitra" ? (
        <div className="card">
          <h2 className="font-semibold">Aktivitas aplikasi saya</h2>
          {myApps.length === 0 ? (
            <div className="mt-3">
              <EmptyState
                title="Belum ada aplikasi."
                hint="Setelah terverifikasi, kirim minat dari halaman Kerja."
              />
              <Link href="/kerja" className="mt-3 inline-block text-sm text-brand-600 hover:underline">
                Ke peluang kerja →
              </Link>
            </div>
          ) : (
            <ul className="mt-3 space-y-2">
              {myApps.map((a) => (
                <li
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-2 text-sm"
                >
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
