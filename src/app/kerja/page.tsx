import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, StatusBadge, EmptyState } from "@/components/ui";
import { KerjaDisclaimer } from "@/components/disclaimers";

export default async function KerjaPage() {
  const user = await getSessionUser();
  if (!user) redirect("/masuk");
  if (user.role === "mitra" && !user.onboardingDone) redirect("/onboarding");

  const list = await prisma.peluangKerja.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Kerja"
        subtitle="Papan lowongan mitra — lihat peluang dan kirim minat jika terverifikasi."
      />
      <KerjaDisclaimer />
      {list.length === 0 ? (
        <EmptyState title="Belum ada peluang kerja." hint="Pantau halaman ini atau lengkapi profil." />
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
