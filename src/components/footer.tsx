import { FOOTER_LEGAL } from "@/lib/constants";

export function AppFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-6 text-center text-xs text-slate-500">
        <p>{FOOTER_LEGAL}</p>
        <p className="mt-1">© 2026 PNC Nexus · Daftar. Tersalurkan. Berkembang.</p>
      </div>
    </footer>
  );
}
