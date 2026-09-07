import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateProfilAction } from "@/lib/actions";
import { FormFlash, PageHeader, StatusBadge } from "@/components/ui";
import { SubmitButton } from "@/components/form-button";

export default async function ProfilPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/masuk");
  if (user.role !== "mitra") redirect("/ringkasan");
  if (!user.onboardingDone) redirect("/onboarding");
  const sp = await searchParams;

  const profile = await prisma.mitraProfile.findUnique({ where: { userId: user.id } });
  if (!profile) redirect("/onboarding");

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <PageHeader
        title="Profil mitra"
        subtitle="Edit data Anda. Status verifikasi dikelola admin."
        actions={<StatusBadge status={profile.status} />}
      />
      <FormFlash error={sp.error} ok={sp.ok} />
      <div className="card text-sm text-slate-600">
        Jalur minat:{" "}
        {[
          profile.jalurKerja && "kerja",
          profile.jalurKomoditi && "komoditi",
          profile.jalurPemerintahan && "pemerintahan",
        ]
          .filter(Boolean)
          .join(", ") || "—"}
        {" · "}
        Tipe: {profile.tipe}
      </div>
      <form action={updateProfilAction} className="card space-y-4">
        <div>
          <label className="label" htmlFor="nama">Nama</label>
          <input className="input" id="nama" name="nama" defaultValue={profile.nama} required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="kota">Kota</label>
            <input className="input" id="kota" name="kota" defaultValue={profile.kota} required />
          </div>
          <div>
            <label className="label" htmlFor="provinsi">Provinsi</label>
            <input className="input" id="provinsi" name="provinsi" defaultValue={profile.provinsi} required />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="wa">WhatsApp</label>
          <input className="input" id="wa" name="wa" defaultValue={profile.wa} required />
        </div>
        <div>
          <label className="label" htmlFor="deskripsi">Deskripsi</label>
          <textarea className="input min-h-24" id="deskripsi" name="deskripsi" defaultValue={profile.deskripsi} required />
        </div>
        <SubmitButton>Simpan perubahan</SubmitButton>
      </form>
    </div>
  );
}
