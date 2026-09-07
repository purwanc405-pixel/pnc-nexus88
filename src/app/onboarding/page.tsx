import { onboardingAction } from "@/lib/actions";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { SubmitButton } from "@/components/form-button";

export default async function OnboardingPage() {
  const user = await getSessionUser();
  if (!user) redirect("/masuk");
  if (user.role !== "mitra") redirect("/ringkasan");
  if (user.onboardingDone) redirect("/ringkasan");

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <PageHeader
        title="Onboarding mitra"
        subtitle="Lengkapi tipe, profil, dan pilih minimal satu jalur minat."
      />
      <form action={onboardingAction} className="card space-y-4" encType="multipart/form-data">
        <fieldset className="space-y-2">
          <legend className="label">Tipe mitra</legend>
          <label className="mr-4 inline-flex items-center gap-2 text-sm">
            <input type="radio" name="tipe" value="individu" required /> Individu
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="radio" name="tipe" value="badan" /> Badan usaha
          </label>
        </fieldset>
        <div>
          <label className="label" htmlFor="nama">Nama / nama usaha</label>
          <input className="input" id="nama" name="nama" required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="kota">Kota</label>
            <input className="input" id="kota" name="kota" required />
          </div>
          <div>
            <label className="label" htmlFor="provinsi">Provinsi</label>
            <input className="input" id="provinsi" name="provinsi" required />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="wa">WhatsApp</label>
          <input className="input" id="wa" name="wa" placeholder="08…" required />
        </div>
        <div>
          <label className="label" htmlFor="deskripsi">Deskripsi singkat</label>
          <textarea className="input min-h-24" id="deskripsi" name="deskripsi" required />
        </div>
        <div>
          <label className="label" htmlFor="dokumen">Dokumen opsional (1 file)</label>
          <input className="input" id="dokumen" name="dokumen" type="file" />
        </div>
        <fieldset className="space-y-2 rounded-lg border border-slate-200 p-3">
          <legend className="px-1 text-sm font-medium">Jalur minat (≥1)</legend>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="jalurKerja" /> Kerja
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="jalurKomoditi" /> Komoditi
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="jalurPemerintahan" /> Pemerintahan
          </label>
        </fieldset>
        <p className="text-xs text-slate-500">
          Status awal setelah selesai: menunggu verifikasi. Anda masih bisa melengkapi data.
        </p>
        <SubmitButton>Simpan & lanjut</SubmitButton>
      </form>
    </div>
  );
}
