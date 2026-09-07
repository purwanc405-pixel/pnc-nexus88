import { prisma } from "./prisma";

const OPS_EMAIL = process.env.OPS_NOTIFY_EMAIL || "ops@pnc.nexus";
const OPS_WA = (process.env.OPS_NOTIFY_WA || "6281200000000").replace(/\D/g, "");

export type NoticeKind = "apply" | "minat" | "dampingan";

/** Persist operator inbox notice + pipeline card. Stub: no SMTP; UI shows mailto/WA. */
export async function notifyOperator(input: {
  kind: NoticeKind;
  judul: string;
  detail: string;
  linkPath?: string;
  mitraWa?: string | null;
  refType?: string;
  refId?: string;
  actorUserId?: string;
}) {
  const notice = await prisma.operatorNotice.create({
    data: {
      kind: input.kind,
      judul: input.judul,
      detail: input.detail,
      linkPath: input.linkPath || null,
      mitraWa: input.mitraWa || null,
    },
  });

  await prisma.pipelineCard.create({
    data: {
      judul: input.judul,
      kolom: "baru",
      refType: input.refType || input.kind,
      refId: input.refId || notice.id,
      catatan: input.detail.slice(0, 240),
      updatedById: input.actorUserId || null,
    },
  });

  return notice;
}

export function operatorMailto(subject: string, body: string) {
  return `mailto:${OPS_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function operatorWaLink(text: string) {
  return `https://wa.me/${OPS_WA}?text=${encodeURIComponent(text)}`;
}

export { OPS_EMAIL, OPS_WA };
