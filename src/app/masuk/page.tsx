import Link from "next/link";
import { loginAction } from "@/lib/actions";
import { SubmitButton } from "@/components/form-button";
import { PageHeader } from "@/components/ui";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function MasukPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getSessionUser();
  if (user) redirect("/ringkasan");
  const sp = await searchParams;

  return (
    <div className="mx-auto max-w-md">
      <PageHeader title="Masuk" subtitle="Masuk dengan email dan password mitra Anda." />
      <form action={loginAction} className="card space-y-4">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input className="input" id="email" name="email" type="email" required />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input className="input" id="password" name="password" type="password" required />
        </div>
        {sp.error ? <p className="text-sm text-rose-600">{sp.error}</p> : null}
        <SubmitButton>Masuk</SubmitButton>
        <p className="text-sm text-slate-600">
          Belum punya akun?{" "}
          <Link href="/daftar" className="text-brand-600 hover:underline">
            Daftar sebagai mitra
          </Link>
        </p>
      </form>
    </div>
  );
}
