import { redirect, notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applyKerjaAction, updateAplikasiStatusAction } from "@/lib/actions";
import { PageHeader, StatusBadge, Alert, FormFlash, EmptyState } from "@/components/ui";
import { KerjaDisclaimer } from "@/components/disclaimers";
import { SubmitButton } from "@/components/form-button";

export default async function KerjaDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/masuk");
  const { id } = await params;
  const sp = await searchParams;
  const peluang = await prisma.peluangKerja.findUnique({
    where: { id },
    include: {
      aplikasi: {
        include: { user: { include: { mitraProfile: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!peluang) notFound();

  const mine = peluang.aplikasi.find((a) => a.userId === user.id);
  const canApply =
    user.role === "mitra" &&
    user.mitraStatus === "terverifikasi" &&
    peluang.status === "buka" &&
    !mine;
  const isOps = user.role === "admin" || user.role === "operator";

  return (
    <div className="space-y-4">
      <PageHeader
        title={peluang.judul}
        subtitle={`${peluang.jenis} · ${peluang.lokasi}`}
        actions={<StatusBadge status={peluang.status} />}
      />
      <KerjaDisclaimer />
      <FormFlash error={sp.error} ok={sp.ok} />
      <div className="card whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
        {peluang.deskripsi}
      </div>

      {mine ? (
        <Alert tone="success">
          Minat Anda sudah terkirim · status <StatusBadge status={mine.status} />
        </Alert>
      ) : null}

      {user.role === "mitra" && !canApply && !mine ? (
        <Alert tone="warn">
          {user.mitraStatus !== "terverifikasi"
            ? "Kirim minat ke peluang ini dinonaktifkan sampai profil terverifikasi."
            : peluang.status !== "buka"
              ? "Peluang ditutup."
              : "Tidak dapat mengirim minat."}
        </Alert>
      ) : null}

      {canApply ? (
        <form action={applyKerjaAction} className="card space-y-3">
          <input type="hidden" name="peluangId" value={peluang.id} />
          <h2 className="font-semibold">Kirim minat ke peluang ini</h2>
          <textarea
            className="input min-h-24"
            name="catatan"
            placeholder="Catatan singkat untuk operator / pemberi kerja"
            required
            minLength={3}
          />
          <SubmitButton>Kirim minat ke peluang ini</SubmitButton>
        </form>
      ) : null}

      {isOps ? (
        <div className="card">
          <h2 className="font-semibold">Inbox aplikasi · alur status</h2>
          <p className="mt-1 text-xs text-slate-500">
            diajukan → ditinjau → diterima / ditolak
          </p>
          {peluang.aplikasi.length === 0 ? (
            <div className="mt-3">
              <EmptyState title="Belum ada aplikasi." hint="Minat mitra terverifikasi muncul di sini." />
            </div>
          ) : (
            <ul className="mt-3 space-y-3 text-sm">
              {peluang.aplikasi.map((a) => (
                <li key={a.id} className="rounded-lg border border-slate-100 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">
                      {a.user.mitraProfile?.nama || a.user.name}
                    </span>
                    <StatusBadge status={a.status} />
                  </div>
                  <p className="mt-1 text-slate-600">{a.catatan}</p>
                  <form action={updateAplikasiStatusAction} className="mt-2 flex flex-wrap items-center gap-2">
                    <input type="hidden" name="aplikasiId" value={a.id} />
                    <input type="hidden" name="peluangId" value={peluang.id} />
                    <select className="input !w-auto" name="status" defaultValue={a.status}>
                      <option value="diajukan">diajukan</option>
                      <option value="ditinjau">ditinjau</option>
                      <option value="diterima">diterima</option>
                      <option value="ditolak">ditolak</option>
                    </select>
                    <SubmitButton className="btn-secondary">Set status</SubmitButton>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
