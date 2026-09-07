import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, StatusBadge, EmptyState, FormFlash } from "@/components/ui";
import { GovDisclaimerBanner } from "@/components/disclaimers";

export default async function PemerintahanPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/masuk");
  if (user.role === "mitra" && !user.onboardingDone) redirect("/onboarding");
  const sp = await searchParams;

  const list = await prisma.peluangPemerintahan.findMany({
    where: { status: "aktif" },
    orderBy: { tanggal: "desc" },
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Pemerintahan"
        subtitle="Informasi & dampingan internal jaringan — bukan portal resmi."
      />
      <GovDisclaimerBanner />
      <FormFlash error={sp.error} ok={sp.ok} />
      {list.length === 0 ? (
        <EmptyState
          title="Belum ada info peluang. Pantau halaman ini atau lengkapi profil agar mudah dihubungi operator."
        />
      ) : (
        <div className="space-y-3">
          {list.map((g) => (
            <Link key={g.id} href={`/pemerintahan/${g.id}`} className="card block hover:border-brand-300">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-semibold text-brand-800">{g.judul}</h2>
                <StatusBadge status={g.status} />
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-slate-600">{g.ringkasan}</p>
              <p className="mt-2 text-xs text-slate-500">
                {g.tanggal.toLocaleDateString("id-ID")} · Bukan portal resmi & bukan jaminan tender
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
