import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const user = await getSessionUser();
  if (user) redirect("/ringkasan");

  return (
    <div className="space-y-10 py-6">
      <section className="card bg-gradient-to-br from-brand-700 to-slate-900 text-white">
        <p className="text-sm font-medium text-brand-100">PNC Nexus</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
          Daftar. Tersalurkan. Berkembang.
        </h1>
        <p className="mt-3 max-w-2xl text-brand-50">
          Daftar sekali. Tersalurkan ke kerja, komoditi, dan peluang jaringan.
          Satu portal mitra independen untuk kontraktor, UMKM, dan pelaku usaha.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/daftar" className="btn bg-white text-brand-700 hover:bg-brand-50">
            Daftar sebagai mitra
          </Link>
          <Link href="/masuk" className="btn border border-white/40 text-white hover:bg-white/10">
            Masuk
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            t: "Kerja",
            d: "Papan lowongan mitra. Lihat peluang dan kirim minat jika profil terverifikasi.",
          },
          {
            t: "Komoditi",
            d: "Listing penawaran mitra — dalam negeri maupun minat ekspor. Harga indikatif.",
          },
          {
            t: "Pemerintahan",
            d: "Info & dampingan internal jaringan. Bukan portal resmi LPSE/SPSE.",
          },
        ].map((p) => (
          <div key={p.t} className="card">
            <h2 className="text-lg font-semibold text-brand-700">{p.t}</h2>
            <p className="mt-2 text-sm text-slate-600">{p.d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
