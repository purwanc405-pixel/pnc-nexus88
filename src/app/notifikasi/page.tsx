import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listForUser } from "@/lib/notifications";
import { PageHeader, FormFlash, EmptyState } from "@/components/ui";
import { markAllNotificationsReadAction, markNotificationReadAction } from "@/lib/actions";

export const dynamic = "force-dynamic";

function fmt(d: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(d);
}

export default async function NotifikasiPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/masuk");
  const sp = await searchParams;
  // Role-scoped: hanya notifikasi milik user yang login
  const items = await listForUser(prisma, user.id);
  const unread = items.filter((n) => !n.readAt).length;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Notifikasi"
        subtitle={unread > 0 ? `${unread} belum dibaca` : "Semua notifikasi sudah dibaca"}
        actions={
          unread > 0 ? (
            <form action={markAllNotificationsReadAction}>
              <button type="submit" className="btn-secondary" data-testid="notif-mark-all">
                Tandai semua sudah dibaca
              </button>
            </form>
          ) : null
        }
      />
      <FormFlash error={sp.error} ok={sp.ok} />
      {items.length === 0 ? (
        <EmptyState title="Belum ada notifikasi" hint="Kabar terbaru terkait akun Anda akan muncul di sini." />
      ) : (
        <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white" data-testid="notif-list">
          {items.map((n) => (
            <li
              key={n.id}
              data-testid="notif-item"
              data-read={n.readAt ? "1" : "0"}
              className={`flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between ${n.readAt ? "" : "bg-brand-50/40"}`}
            >
              <div className="min-w-0">
                <p className="font-medium text-slate-900">
                  {!n.readAt ? <span className="mr-2 inline-block h-2 w-2 rounded-full bg-red-600 align-middle" aria-label="belum dibaca" /> : null}
                  {n.title}
                </p>
                <p className="mt-0.5 text-sm text-slate-600">{n.body}</p>
                <p className="mt-1 text-xs text-slate-400">{fmt(n.createdAt)}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                {n.link ? (
                  <form action={markNotificationReadAction}>
                    <input type="hidden" name="id" value={n.id} />
                    <input type="hidden" name="go" value={n.link} />
                    <button type="submit" className="btn-secondary !px-2.5 !py-1.5 text-xs">Buka</button>
                  </form>
                ) : null}
                {!n.readAt ? (
                  <form action={markNotificationReadAction}>
                    <input type="hidden" name="id" value={n.id} />
                    <button type="submit" className="btn-secondary !px-2.5 !py-1.5 text-xs" data-testid="notif-mark-one">
                      Tandai dibaca
                    </button>
                  </form>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
