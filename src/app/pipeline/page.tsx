import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { movePipelineAction } from "@/lib/actions";
import { PageHeader, EmptyState } from "@/components/ui";
import { SubmitButton } from "@/components/form-button";

const KOLOM = [
  ["baru", "Baru"],
  ["ditinjau", "Ditinjau"],
  ["dihubungi", "Dihubungi"],
  ["tersalurkan", "Tersalurkan"],
  ["tidak_cocok", "Tidak cocok"],
] as const;

export default async function PipelinePage() {
  const user = await getSessionUser();
  if (!user) redirect("/masuk");
  if (user.role !== "admin" && user.role !== "operator") redirect("/ringkasan");

  const cards = await prisma.pipelineCard.findMany({
    include: { updatedBy: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Pipeline"
        subtitle="Kanban operator: pindahkan kartu antar kolom. Perubahan mencatat updated_at + actor."
      />
      {cards.length === 0 ? (
        <EmptyState title="Belum ada kartu pipeline." />
      ) : (
        <div className="grid gap-3 lg:grid-cols-5">
          {KOLOM.map(([key, label]) => {
            const col = cards.filter((c) => c.kolom === key);
            return (
              <div key={key} className="rounded-xl border border-slate-200 bg-slate-100/60 p-2">
                <h2 className="mb-2 px-1 text-sm font-semibold text-slate-700">
                  {label} ({col.length})
                </h2>
                <div className="space-y-2">
                  {col.map((c) => (
                    <div key={c.id} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                      <p className="text-sm font-medium">{c.judul}</p>
                      {c.catatan ? (
                        <p className="mt-1 text-xs text-slate-500">{c.catatan}</p>
                      ) : null}
                      <p className="mt-2 text-[10px] text-slate-400">
                        {c.updatedAt.toLocaleString("id-ID")}
                        {c.updatedBy ? ` · ${c.updatedBy.email}` : ""}
                      </p>
                      <form action={movePipelineAction} className="mt-2 flex gap-1">
                        <input type="hidden" name="id" value={c.id} />
                        <select className="input !py-1 text-xs" name="kolom" defaultValue={c.kolom}>
                          {KOLOM.map(([k, l]) => (
                            <option key={k} value={k}>
                              {l}
                            </option>
                          ))}
                        </select>
                        <SubmitButton className="btn-secondary !px-2 !py-1 text-xs">
                          Pindah
                        </SubmitButton>
                      </form>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
