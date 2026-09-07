import { redirect, notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dampinganAction } from "@/lib/actions";
import { GOV_DISCLAIMER_CHECKBOX } from "@/lib/constants";
import { PageHeader, StatusBadge, Alert } from "@/components/ui";
import { GovDisclaimerBanner } from "@/components/disclaimers";
import { SubmitButton } from "@/components/form-button";

export default async function GovDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/masuk");
  const { id } = await params;
  const item = await prisma.peluangPemerintahan.findUnique({
    where: { id },
    include: { dampingan: { where: { userId: user.id } } },
  });
  if (!item) notFound();
  const mine = item.dampingan[0];

  return (
    <div className="space-y-4">
      <PageHeader
        title={item.judul}
        subtitle={item.tanggal.toLocaleDateString("id-ID")}
        actions={<StatusBadge status={item.status} />}
      />
      <GovDisclaimerBanner />
      <div className="card space-y-3 text-sm text-slate-700">
        <p className="whitespace-pre-wrap leading-relaxed">{item.ringkasan}</p>
        <p>
          <span className="font-medium">Sumber info:</span> {item.sumberInfo}
        </p>
        {item.inaprocUrl ? (
          <a
            href={item.inaprocUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex"
          >
            Buka di INAPROC
          </a>
        ) : null}
      </div>

      {mine ? (
        <Alert tone="success">
          Permintaan dampingan terkirim pada{" "}
          {mine.disclaimerCheckedAt.toLocaleString("id-ID")} (checkbox pemahaman
          tercatat).
        </Alert>
      ) : user.role === "mitra" ? (
        <form action={dampinganAction} className="card space-y-3">
          <input type="hidden" name="peluangId" value={item.id} />
          <h2 className="font-semibold">Minta dampingan (internal)</h2>
          <textarea
            className="input min-h-24"
            name="catatan"
            required
            placeholder="Contoh: Butuh review kelengkapan NIB & daftar pengalaman."
          />
          <label className="flex items-start gap-2 text-sm text-slate-700">
            <input type="checkbox" name="disclaimer" className="mt-1" required />
            <span>{GOV_DISCLAIMER_CHECKBOX}</span>
          </label>
          <SubmitButton>Minta dampingan (internal)</SubmitButton>
        </form>
      ) : null}
    </div>
  );
}
