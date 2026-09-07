import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
      </div>
      {actions}
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="card text-center text-slate-600">
      <p className="font-medium text-slate-800">{title}</p>
      {hint ? <p className="mt-1 text-sm">{hint}</p> : null}
    </div>
  );
}

export function Alert({
  children,
  tone = "info",
}: {
  children: ReactNode;
  tone?: "info" | "warn" | "danger" | "success";
}) {
  const map = {
    info: "border-sky-200 bg-sky-50 text-sky-900",
    warn: "border-amber-200 bg-amber-50 text-amber-950",
    danger: "border-rose-200 bg-rose-50 text-rose-900",
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  };
  return (
    <div className={`rounded-xl border p-4 text-sm leading-relaxed ${map[tone]}`}>
      {children}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    menunggu_verifikasi: "bg-amber-100 text-amber-800",
    terverifikasi: "bg-emerald-100 text-emerald-800",
    ditolak: "bg-rose-100 text-rose-800",
    ditangguhkan: "bg-slate-200 text-slate-700",
    buka: "bg-emerald-100 text-emerald-800",
    tutup: "bg-slate-200 text-slate-700",
    aktif: "bg-emerald-100 text-emerald-800",
    draft: "bg-slate-200 text-slate-700",
    ditutup: "bg-slate-200 text-slate-700",
    diajukan: "bg-sky-100 text-sky-800",
    ditinjau: "bg-violet-100 text-violet-800",
    diterima: "bg-emerald-100 text-emerald-800",
  };
  return (
    <span className={`badge ${colors[status] || "bg-slate-100 text-slate-700"}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}
