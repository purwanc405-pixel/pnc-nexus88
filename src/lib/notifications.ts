import type { PrismaClient, Role } from "@prisma/client";

/** Jenis notifikasi in-app P0. */
export type NotificationType =
  | "mitra_daftar"
  | "mitra_status"
  | "aplikasi_baru"
  | "aplikasi_status"
  | "listing_baru";

export type NotificationPayload = {
  type: NotificationType;
  title: string;
  body: string;
  link?: string | null;
};

type Db = Pick<PrismaClient, "notification" | "user">;

function log(...args: unknown[]) {
  if (process.env.NODE_ENV !== "test") console.log("[notifikasi]", ...args);
}

/** Email opsional via Resend. Aktif hanya jika RESEND_API_KEY + NOTIFY_FROM diset. Tidak pernah throw. */
export async function sendEmailBestEffort(
  to: string[],
  subject: string,
  text: string
): Promise<"sent" | "skipped" | "failed"> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFY_FROM;
  if (!key || !from) {
    log("email dilewati (RESEND_API_KEY/NOTIFY_FROM belum diset)", subject);
    return "skipped";
  }
  if (to.length === 0) return "skipped";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, text }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      log("email gagal", res.status);
      return "failed";
    }
    return "sent";
  } catch (e) {
    log("email error", (e as Error).message);
    return "failed";
  }
}

function appUrl(link?: string | null) {
  const base = process.env.APP_URL || "https://pnc-nexus88.vercel.app";
  return link ? base.replace(/\/$/, "") + link : base;
}

/** Buat notifikasi untuk daftar user. Tidak pernah throw (aksi user tidak boleh gagal karena notifikasi). */
export async function notifyUsers(db: Db, userIds: string[], p: NotificationPayload) {
  const ids = [...new Set(userIds.filter(Boolean))];
  if (ids.length === 0) return 0;
  try {
    await db.notification.createMany({
      data: ids.map((userId) => ({
        userId,
        type: p.type,
        title: p.title,
        body: p.body,
        link: p.link ?? null,
      })),
    });
  } catch (e) {
    log("gagal menyimpan notifikasi", (e as Error).message);
    return 0;
  }
  try {
    const users = await db.user.findMany({ where: { id: { in: ids } }, select: { email: true } });
    await sendEmailBestEffort(
      users.map((u) => u.email),
      `[PNC Nexus] ${p.title}`,
      `${p.body}\n\nBuka: ${appUrl(p.link)}`
    );
  } catch (e) {
    log("email error", (e as Error).message);
  }
  return ids.length;
}

export async function notifyRoles(
  db: Db,
  roles: Role[],
  p: NotificationPayload,
  excludeUserId?: string
) {
  try {
    const users = await db.user.findMany({ where: { role: { in: roles } }, select: { id: true } });
    return notifyUsers(db, users.map((u) => u.id).filter((id) => id !== excludeUserId), p);
  } catch (e) {
    log("gagal ambil penerima", (e as Error).message);
    return 0;
  }
}

// ---------- Trigger P0 ----------

export function onMitraRegistered(db: Db, m: { userId: string; nama: string; kota: string }) {
  return notifyRoles(db, ["admin", "operator"], {
    type: "mitra_daftar",
    title: `Mitra baru menunggu verifikasi: ${m.nama}`,
    body: `${m.nama} (${m.kota}) menyelesaikan onboarding dan menunggu verifikasi.`,
    link: "/mitra",
  });
}

const STATUS_MITRA_LABEL: Record<string, string> = {
  terverifikasi: "terverifikasi",
  ditolak: "ditolak",
  ditangguhkan: "ditangguhkan",
  menunggu_verifikasi: "menunggu verifikasi",
};

export function onMitraStatusChanged(
  db: Db,
  m: { userId: string; status: string; catatan?: string | null }
) {
  const label = STATUS_MITRA_LABEL[m.status] || m.status;
  const body =
    m.status === "terverifikasi"
      ? "Selamat, profil mitra Anda telah terverifikasi. Anda kini dapat mengirim minat dan membuat listing."
      : `Status profil mitra Anda kini: ${label}.${m.catatan ? ` Catatan: ${m.catatan}` : ""}`;
  return notifyUsers(db, [m.userId], {
    type: "mitra_status",
    title: `Status mitra: ${label}`,
    body,
    link: "/profil",
  });
}

/** PeluangKerja belum punya kolom pemilik; pemilik = tim admin/ops yang mengelola peluang. */
export function onAplikasiBaru(
  db: Db,
  a: { applicantId: string; applicantName: string; peluangId: string; peluangJudul: string; ownerId?: string | null }
) {
  const p: NotificationPayload = {
    type: "aplikasi_baru",
    title: `Minat kerja baru: ${a.peluangJudul}`,
    body: `${a.applicantName} mengirim minat untuk "${a.peluangJudul}".`,
    link: `/kerja/${a.peluangId}`,
  };
  return (async () => {
    let n = 0;
    if (a.ownerId && a.ownerId !== a.applicantId) n += await notifyUsers(db, [a.ownerId], p);
    const users = await db.user
      .findMany({ where: { role: { in: ["admin", "operator"] } }, select: { id: true } })
      .catch(() => [] as { id: string }[]);
    n += await notifyUsers(
      db,
      users.map((u) => u.id).filter((id) => id !== a.ownerId && id !== a.applicantId),
      p
    );
    return n;
  })();
}

const STATUS_APLIKASI_LABEL: Record<string, string> = {
  diajukan: "diajukan",
  ditinjau: "sedang ditinjau",
  diterima: "diterima",
  ditolak: "tidak dilanjutkan",
};

export function onAplikasiStatusChanged(
  db: Db,
  a: { applicantId: string; peluangId: string; peluangJudul: string; status: string }
) {
  const label = STATUS_APLIKASI_LABEL[a.status] || a.status;
  return notifyUsers(db, [a.applicantId], {
    type: "aplikasi_status",
    title: `Status minat kerja: ${label}`,
    body: `Minat Anda untuk "${a.peluangJudul}" kini berstatus ${label}.`,
    link: `/kerja/${a.peluangId}`,
  });
}

export function onListingBaru(
  db: Db,
  l: { ownerId: string; ownerName: string; nama: string; status: string }
) {
  return notifyRoles(
    db,
    ["operator"],
    {
      type: "listing_baru",
      title: `Listing komoditi baru: ${l.nama}`,
      body: `${l.ownerName} membuat listing "${l.nama}" (status ${l.status}).`,
      link: "/komoditi",
    },
    l.ownerId
  );
}

// ---------- Baca / tandai ----------

export async function unreadCount(db: Db, userId: string) {
  try {
    return await db.notification.count({ where: { userId, readAt: null } });
  } catch {
    return 0;
  }
}

export async function listForUser(db: Db, userId: string, take = 100) {
  try {
    return await db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take,
    });
  } catch {
    return [];
  }
}

/** Hanya menandai milik user sendiri (role-scoped). Mengembalikan jumlah baris yang berubah. */
export async function markRead(db: Db, userId: string, id: string) {
  const r = await db.notification.updateMany({
    where: { id, userId, readAt: null },
    data: { readAt: new Date() },
  });
  return r.count;
}

export async function markAllRead(db: Db, userId: string) {
  const r = await db.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
  return r.count;
}
