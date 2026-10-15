// Tes trigger + read-state notifikasi (butuh DATABASE_URL Postgres lokal/staging; JANGAN produksi).
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import {
  onMitraRegistered,
  onMitraStatusChanged,
  onAplikasiBaru,
  onAplikasiStatusChanged,
  onListingBaru,
  unreadCount,
  listForUser,
  markRead,
  markAllRead,
  sendEmailBestEffort,
  notifyUsers,
} from "../src/lib/notifications";

const db = new PrismaClient();
const tag = `t${Date.now()}`;
let admin: string, ops: string, m1: string, m2: string;

async function mk(role: "admin" | "operator" | "mitra", n: string) {
  const u = await db.user.create({
    data: { email: `${n}-${tag}@test.local`, name: n, passwordHash: "x", role },
  });
  return u.id;
}
const of = (userId: string) => db.notification.findMany({ where: { userId } });

before(async () => {
  delete process.env.RESEND_API_KEY;
  admin = await mk("admin", "adm");
  ops = await mk("operator", "ops");
  m1 = await mk("mitra", "m1");
  m2 = await mk("mitra", "m2");
});
after(async () => {
  await db.user.deleteMany({ where: { email: { endsWith: `-${tag}@test.local` } } });
  await db.$disconnect();
});

test("mitra daftar -> admin & ops", async () => {
  await onMitraRegistered(db, { userId: m1, nama: "Mitra Satu", kota: "Solo" });
  assert.ok((await of(admin)).some((n) => n.type === "mitra_daftar"));
  assert.ok((await of(ops)).some((n) => n.type === "mitra_daftar"));
  assert.equal((await of(m1)).length, 0);
});

test("approve/reject -> mitra terkait saja", async () => {
  await onMitraStatusChanged(db, { userId: m1, status: "terverifikasi" });
  await onMitraStatusChanged(db, { userId: m1, status: "ditolak", catatan: "Data kurang" });
  const n = await of(m1);
  assert.equal(n.filter((x) => x.type === "mitra_status").length, 2);
  assert.ok(n.some((x) => x.body.includes("Data kurang")));
  assert.equal((await of(m2)).length, 0);
});

test("aplikasi baru -> pemilik + ops, tanpa duplikat", async () => {
  await onAplikasiBaru(db, {
    applicantId: m2, applicantName: "m2", peluangId: "p1", peluangJudul: "Operator Gudang", ownerId: admin,
  });
  assert.equal((await of(admin)).filter((n) => n.type === "aplikasi_baru").length, 1);
  assert.equal((await of(ops)).filter((n) => n.type === "aplikasi_baru").length, 1);
  assert.equal((await of(m2)).filter((n) => n.type === "aplikasi_baru").length, 0);
});

test("status aplikasi diubah -> pelamar", async () => {
  await onAplikasiStatusChanged(db, { applicantId: m2, peluangId: "p1", peluangJudul: "Operator Gudang", status: "diterima" });
  const n = (await of(m2)).find((x) => x.type === "aplikasi_status");
  assert.ok(n);
  assert.equal(n!.link, "/kerja/p1");
});

test("listing baru -> ops", async () => {
  await onListingBaru(db, { ownerId: m1, ownerName: "m1", nama: "Kopi", status: "aktif" });
  assert.ok((await of(ops)).some((n) => n.type === "listing_baru"));
  assert.equal((await of(m1)).filter((n) => n.type === "listing_baru").length, 0);
});

test("read-state: hitung, tandai satu, scoping, tandai semua", async () => {
  const before = await unreadCount(db, m1);
  assert.ok(before >= 2);
  const [first] = await listForUser(db, m1);
  // user lain tidak bisa menandai milik m1
  assert.equal(await markRead(db, m2, first.id), 0);
  assert.equal(await unreadCount(db, m1), before);
  assert.equal(await markRead(db, m1, first.id), 1);
  assert.equal(await unreadCount(db, m1), before - 1);
  assert.equal(await markRead(db, m1, first.id), 0); // idempoten
  await markAllRead(db, m1);
  assert.equal(await unreadCount(db, m1), 0);
  // list hanya milik sendiri
  assert.ok((await listForUser(db, m1)).every((n) => n.userId === m1));
});

test("email: dilewati tanpa RESEND_API_KEY; tidak pernah throw", async () => {
  assert.equal(await sendEmailBestEffort(["a@b.c"], "s", "t"), "skipped");
  process.env.RESEND_API_KEY = "dummy";
  process.env.NOTIFY_FROM = "x@y.z";
  const orig = globalThis.fetch;
  globalThis.fetch = (async () => { throw new Error("network down"); }) as typeof fetch;
  try {
    assert.equal(await sendEmailBestEffort(["a@b.c"], "s", "t"), "failed");
    assert.equal(await notifyUsers(db, [m2], { type: "mitra_status", title: "x", body: "y" }), 1);
  } finally {
    globalThis.fetch = orig;
    delete process.env.RESEND_API_KEY;
    delete process.env.NOTIFY_FROM;
  }
});

test("gagal simpan tidak melempar error", async () => {
  const broken = { notification: { createMany: async () => { throw new Error("no table"); } }, user: db.user } as never;
  assert.equal(await notifyUsers(broken, [m1], { type: "mitra_status", title: "x", body: "y" }), 0);
});
