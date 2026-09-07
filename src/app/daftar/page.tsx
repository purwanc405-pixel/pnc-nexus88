import Link from "next/link";
import { registerAction } from "@/lib/actions";
import { SubmitButton } from "@/components/form-button";
import { FormFlash, PageHeader } from "@/components/ui";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DaftarPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getSessionUser();
  if (user) redirect("/ringkasan");
  const sp = await searchParams;

  return (
    <div className="mx-auto max-w-md">
      <PageHeader
        title="Daftar sebagai mitra"
        subtitle="Buat akun email + password, lalu lengkapi onboarding."
      />
      <form action={registerAction} className="card space-y-4">
        <FormFlash error={sp.error} />
        <div>
          <label className="label" htmlFor="name">Nama</label>
          <input className="input" id="name" name="name" required />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input className="input" id="email" name="email" type="email" required />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input className="input" id="password" name="password" type="password" minLength={8} required />
        </div>
        <SubmitButton>Buat akun</SubmitButton>
        <p className="text-sm text-slate-600">
          Sudah punya akun?{" "}
          <Link href="/masuk" className="text-brand-600 hover:underline">
            Masuk
          </Link>
        </p>
      </form>
    </div>
  );
}
