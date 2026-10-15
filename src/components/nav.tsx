import Link from "next/link";
import { logoutAction } from "@/lib/actions";
import type { SessionUser } from "@/lib/auth";

const mitraLinks = [
  { href: "/ringkasan", label: "Ringkasan" },
  { href: "/kerja", label: "Kerja" },
  { href: "/komoditi", label: "Komoditi" },
  { href: "/pemerintahan", label: "Pemerintahan" },
  { href: "/profil", label: "Profil" },
];

export function AppNav({ user, unread = 0 }: { user: SessionUser | null; unread?: number }) {
  const links = [...mitraLinks];
  if (user && (user.role === "operator" || user.role === "admin")) {
    links.push({ href: "/mitra", label: "Mitra" });
    links.push({ href: "/pipeline", label: "Pipeline" });
  }
  if (user?.role === "admin") {
    links.push({ href: "/admin", label: "Admin" });
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href={user ? "/ringkasan" : "/"} className="font-bold text-brand-700">
          PNC Nexus
        </Link>
        {user ? (
          <nav className="flex flex-wrap items-center gap-1 text-sm">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-md px-2.5 py-1.5 text-slate-700 hover:bg-slate-100"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/notifikasi"
              data-testid="notif-bell"
              aria-label={unread > 0 ? `Notifikasi, ${unread} belum dibaca` : "Notifikasi"}
              className="relative rounded-md px-2.5 py-1.5 text-slate-700 hover:bg-slate-100"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
              {unread > 0 ? (
                <span
                  data-testid="notif-count"
                  className="absolute -right-0.5 -top-0.5 min-w-[1.1rem] rounded-full bg-red-600 px-1 text-center text-[10px] font-semibold leading-[1.1rem] text-white"
                >
                  {unread > 99 ? "99+" : unread}
                </span>
              ) : null}
            </Link>
            <span className="mx-1 hidden text-slate-300 sm:inline">|</span>
            <span className="px-2 text-xs text-slate-500">
              {user.name} · {user.role}
            </span>
            <form action={logoutAction}>
              <button type="submit" className="btn-secondary !px-2.5 !py-1.5 text-xs">
                Keluar
              </button>
            </form>
          </nav>
        ) : (
          <div className="flex gap-2">
            <Link href="/masuk" className="btn-secondary">
              Masuk
            </Link>
            <Link href="/daftar" className="btn-primary">
              Daftar sebagai mitra
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
