import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createListingAction, minatKomoditiAction } from "@/lib/actions";
import { PageHeader, StatusBadge, EmptyState } from "@/components/ui";
import { KomoditiDisclaimer } from "@/components/disclaimers";
import { SubmitButton } from "@/components/form-button";

export default async function KomoditiPage() {
  const user = await getSessionUser();
  if (!user) redirect("/masuk");
  if (user.role === "mitra" && !user.onboardingDone) redirect("/onboarding");

  const isOps = user.role === "admin" || user.role === "operator";
  const listings = await prisma.listingKomoditi.findMany({
    where: isOps
      ? undefined
      : {
          OR: [
            { status: "aktif" },
            { pemilikId: user.id },
          ],
        },
    include: {
      pemilik: { include: { mitraProfile: true } },
      minat: { include: { user: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const canCreate =
    user.role === "mitra" && user.mitraStatus === "terverifikasi";

  return (
    <div className="space-y-4">
      <PageHeader
        title="Komoditi"
        subtitle="Listing penawaran mitra. Harga indikatif · penawaran mitra."
      />
      <KomoditiDisclaimer />

      {canCreate ? (
        <details className="card">
          <summary className="cursor-pointer font-semibold">Buat listing</summary>
          <form action={createListingAction} className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Nama komoditi</label>
              <input className="input" name="nama" required />
            </div>
            <div>
              <label className="label">Kategori</label>
              <input className="input" name="kategori" required />
            </div>
            <div>
              <label className="label">Volume / unit</label>
              <input className="input" name="volume" required />
            </div>
            <div>
              <label className="label">Harga indikatif (opsional)</label>
              <input className="input" name="hargaIndikatif" placeholder="contoh: Rp 12.500 / kg" />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" name="status" defaultValue="aktif">
                <option value="draft">draft</option>
                <option value="aktif">aktif</option>
              </select>
            </div>
            <div>
              <label className="label">Asal</label>
              <input className="input" name="asal" required />
            </div>
            <div>
              <label className="label">Tujuan</label>
              <input className="input" name="tujuan" required />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Catatan</label>
              <textarea className="input" name="catatan" />
            </div>
            <div className="sm:col-span-2">
              <SubmitButton>Buat listing</SubmitButton>
            </div>
          </form>
        </details>
      ) : user.role === "mitra" ? (
        <p className="text-sm text-amber-800">
          Buat listing tersedia setelah profil terverifikasi (dan tidak ditolak/ditangguhkan).
        </p>
      ) : null}

      {listings.length === 0 ? (
        <EmptyState
          title="Belum ada listing. Buat listing pertama Anda."
          hint="Listing aktif akan muncul untuk mitra lain."
        />
      ) : (
        <div className="space-y-3">
          {listings.map((l) => {
            const already = l.minat.some((m) => m.userId === user.id);
            return (
              <div key={l.id} className="card space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-semibold">{l.nama}</h2>
                  <StatusBadge status={l.status} />
                </div>
                <p className="text-sm text-slate-600">
                  {l.kategori} · {l.volume} · {l.asal} → {l.tujuan}
                </p>
                {l.hargaIndikatif ? (
                  <p className="text-sm">
                    <span className="font-medium">{l.hargaIndikatif}</span>{" "}
                    <span className="text-xs text-slate-500">
                      · Indikatif · penawaran mitra (bukan HET/HPP/harga pemerintah)
                    </span>
                  </p>
                ) : null}
                <p className="text-xs text-slate-500">
                  Pemilik: {l.pemilik.mitraProfile?.nama || l.pemilik.name}
                  {l.catatan ? ` · ${l.catatan}` : ""}
                </p>
                {l.status === "aktif" && user.id !== l.pemilikId && !already ? (
                  <form action={minatKomoditiAction} className="flex flex-wrap gap-2 pt-1">
                    <input type="hidden" name="listingId" value={l.id} />
                    <input className="input !w-auto min-w-[200px]" name="catatan" placeholder="Catatan opsional" />
                    <SubmitButton>Saya tertarik</SubmitButton>
                  </form>
                ) : null}
                {already ? (
                  <p className="text-xs text-emerald-700">Anda sudah menandai tertarik.</p>
                ) : null}
                {isOps && l.minat.length > 0 ? (
                  <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                    Antrian minat ({l.minat.length}):{" "}
                    {l.minat.map((m) => m.user.name).join(", ")}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
