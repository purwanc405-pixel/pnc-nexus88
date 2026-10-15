"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import {
  createSession,
  destroySession,
  getSessionUser,
  hashPassword,
  verifyPassword,
} from "./auth";
import { notifyOperator } from "./notify";
import {
  markAllRead,
  markRead,
  onAplikasiBaru,
  onAplikasiStatusChanged,
  onListingBaru,
  onMitraRegistered,
  onMitraStatusChanged,
} from "./notifications";

/** Soft validation failure: redirect with searchParams error (no thrown Error UX). */
function failTo(path: string, msg: string): never {
  redirect(`${path}?error=${encodeURIComponent(msg)}`);
}

function ok(): void {
  return;
}

export async function registerAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const name = String(formData.get("name") || "").trim();
  if (!email || !password || !name) return failTo("/daftar", "Lengkapi semua field.");
  if (password.length < 8)
    return failTo("/daftar", "Password minimal 8 karakter.");
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return failTo("/daftar", "Email sudah terdaftar.");
  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash: await hashPassword(password),
      role: "mitra",
    },
  });
  await createSession(user.id, "mitra");
  redirect("/onboarding");
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const user = await prisma.user.findUnique({
    where: { email },
    include: { mitraProfile: true },
  });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    redirect("/masuk?error=" + encodeURIComponent("Email atau password salah."));
  }
  await createSession(user.id, user.role);
  if (user.role === "mitra" && !user.mitraProfile?.onboardingDone) {
    redirect("/onboarding");
  }
  redirect("/ringkasan");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

export async function onboardingAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user || user.role !== "mitra")
    return failTo("/ringkasan", "Tidak diizinkan.");
  const tipe = String(formData.get("tipe") || "") as "individu" | "badan";
  const nama = String(formData.get("nama") || "").trim();
  const kota = String(formData.get("kota") || "").trim();
  const provinsi = String(formData.get("provinsi") || "").trim();
  const wa = String(formData.get("wa") || "").trim();
  const deskripsi = String(formData.get("deskripsi") || "").trim();
  const jalurKerja = formData.get("jalurKerja") === "on";
  const jalurKomoditi = formData.get("jalurKomoditi") === "on";
  const jalurPemerintahan = formData.get("jalurPemerintahan") === "on";
  if (!["individu", "badan"].includes(tipe))
    return failTo("/onboarding", "Pilih tipe mitra.");
  if (!nama || !kota || !provinsi || !wa || !deskripsi)
    return failTo("/onboarding", "Lengkapi profil.");
  if (!jalurKerja && !jalurKomoditi && !jalurPemerintahan)
    return failTo("/onboarding", "Pilih minimal satu jalur minat.");

  const file = formData.get("dokumen");
  let dokumenPath: string | undefined;
  if (file && file instanceof File && file.size > 0) {
    const { writeFile, mkdir } = await import("fs/promises");
    const path = await import("path");
    const dir = path.join(process.cwd(), "uploads");
    await mkdir(dir, { recursive: true });
    const safe = `${user.id}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const buf = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, safe), buf);
    dokumenPath = safe;
  }

  const wasOnboarded = (
    await prisma.mitraProfile.findUnique({ where: { userId: user.id } })
  )?.onboardingDone;
  await prisma.mitraProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      tipe,
      nama,
      kota,
      provinsi,
      wa,
      deskripsi,
      dokumenPath,
      jalurKerja,
      jalurKomoditi,
      jalurPemerintahan,
      status: "menunggu_verifikasi",
      onboardingDone: true,
    },
    update: {
      tipe,
      nama,
      kota,
      provinsi,
      wa,
      deskripsi,
      dokumenPath: dokumenPath || undefined,
      jalurKerja,
      jalurKomoditi,
      jalurPemerintahan,
      onboardingDone: true,
    },
  });

  await prisma.pipelineCard.create({
    data: {
      judul: `Mitra baru: ${nama}`,
      kolom: "baru",
      refType: "mitra",
      refId: user.id,
      catatan: "Menunggu verifikasi",
      updatedById: user.id,
    },
  });
  if (!wasOnboarded) await onMitraRegistered(prisma, { userId: user.id, nama, kota });

  redirect("/ringkasan");
}

export async function updateProfilAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user || user.role !== "mitra")
    return failTo("/ringkasan", "Tidak diizinkan.");
  const nama = String(formData.get("nama") || "").trim();
  const kota = String(formData.get("kota") || "").trim();
  const provinsi = String(formData.get("provinsi") || "").trim();
  const wa = String(formData.get("wa") || "").trim();
  const deskripsi = String(formData.get("deskripsi") || "").trim();
  if (!nama || !kota || !provinsi || !wa || !deskripsi)
    return failTo("/profil", "Lengkapi profil.");
  await prisma.mitraProfile.update({
    where: { userId: user.id },
    data: { nama, kota, provinsi, wa, deskripsi },
  });
  revalidatePath("/profil");
  redirect("/profil?ok=" + encodeURIComponent("Profil disimpan."));
}

export async function setMitraStatusAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user || (user.role !== "admin" && user.role !== "operator"))
    return failTo("/ringkasan", "Tidak diizinkan.");
  if (user.role === "operator" && formData.get("forceAdmin") === "1")
    return failTo("/mitra", "Hanya admin.");
  if (user.role !== "admin")
    return failTo("/mitra", "Hanya admin yang mengubah status mitra.");
  const profileId = String(formData.get("profileId") || "");
  const status = String(formData.get("status") || "") as
    | "menunggu_verifikasi"
    | "terverifikasi"
    | "ditolak"
    | "ditangguhkan";
  const allowed = [
    "menunggu_verifikasi",
    "terverifikasi",
    "ditolak",
    "ditangguhkan",
  ];
  if (!allowed.includes(status)) return failTo("/mitra", "Status tidak valid.");
  const catatanStatus = String(formData.get("catatanStatus") || "").trim() || null;
  const cekProfilLengkap = formData.get("cekProfilLengkap") === "on";
  const cekKontakValid = formData.get("cekKontakValid") === "on";
  const cekJalurSesuai = formData.get("cekJalurSesuai") === "on";
  const back = String(formData.get("back") || "/admin");

  if (status === "terverifikasi") {
    if (!cekProfilLengkap || !cekKontakValid || !cekJalurSesuai) {
      return failTo(
        back,
        "Centang checklist verifikasi (profil, kontak, jalur) sebelum approve."
      );
    }
  }
  if (status === "ditolak" && !catatanStatus) {
    return failTo(back, "Isi alasan penolakan (catatan reject) sebelum menolak.");
  }

  const before = await prisma.mitraProfile.findUnique({ where: { id: profileId } });
  if (!before) return failTo(back, "Profil tidak ditemukan.");
  await prisma.mitraProfile.update({
    where: { id: profileId },
    data: {
      status,
      catatanStatus,
      cekProfilLengkap,
      cekKontakValid,
      cekJalurSesuai,
    },
  });
  if (before.status !== status)
    await onMitraStatusChanged(prisma, { userId: before.userId, status, catatan: catatanStatus });
  revalidatePath("/mitra");
  revalidatePath("/admin");
  revalidatePath("/ringkasan");
  redirect(back + "?ok=" + encodeURIComponent("Status mitra diperbarui."));
}

export async function updateAplikasiStatusAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user || (user.role !== "admin" && user.role !== "operator"))
    return failTo("/ringkasan", "Tidak diizinkan.");
  const aplikasiId = String(formData.get("aplikasiId") || "");
  const peluangId = String(formData.get("peluangId") || "");
  const back = peluangId ? `/kerja/${peluangId}` : "/kerja";
  const status = String(formData.get("status") || "") as
    | "diajukan"
    | "ditinjau"
    | "diterima"
    | "ditolak";
  const allowed = ["diajukan", "ditinjau", "diterima", "ditolak"];
  if (!aplikasiId || !allowed.includes(status))
    return failTo(back, "Status aplikasi tidak valid.");
  const prev = await prisma.aplikasi.findUnique({
    where: { id: aplikasiId },
    include: { peluang: true },
  });
  if (!prev) return failTo(back, "Aplikasi tidak ditemukan.");
  await prisma.aplikasi.update({
    where: { id: aplikasiId },
    data: { status },
  });
  if (prev.status !== status)
    await onAplikasiStatusChanged(prisma, {
      applicantId: prev.userId,
      peluangId: prev.peluangId,
      peluangJudul: prev.peluang.judul,
      status,
    });
  revalidatePath(back);
  revalidatePath("/kerja");
  revalidatePath("/admin");
  redirect(back + "?ok=" + encodeURIComponent("Status aplikasi diperbarui."));
}

export async function markNoticeReadAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user || (user.role !== "admin" && user.role !== "operator"))
    return failTo("/ringkasan", "Tidak diizinkan.");
  const id = String(formData.get("id") || "");
  if (!id) return failTo("/ringkasan", "ID tidak valid.");
  await prisma.operatorNotice.update({
    where: { id },
    data: { readAt: new Date() },
  });
  revalidatePath("/ringkasan");
  revalidatePath("/admin");
  return ok();
}

export async function applyKerjaAction(formData: FormData) {
  const peluangId = String(formData.get("peluangId") || "");
  const back = peluangId ? `/kerja/${peluangId}` : "/kerja";
  const user = await getSessionUser();
  if (!user) return failTo("/masuk", "Login dulu.");
  if (user.role !== "mitra")
    return failTo(back, "Hanya mitra yang dapat mengirim minat.");
  if (user.mitraStatus !== "terverifikasi")
    return failTo(
      back,
      "Kirim minat hanya untuk mitra terverifikasi. Profil Anda belum terverifikasi."
    );
  const catatan = String(formData.get("catatan") || "").trim();
  if (!catatan) return failTo(back, "Isi catatan singkat.");
  const peluang = await prisma.peluangKerja.findUnique({ where: { id: peluangId } });
  if (!peluang || peluang.status !== "buka")
    return failTo(back, "Peluang tidak tersedia.");
  let aplikasiId = "";
  try {
    const created = await prisma.aplikasi.create({
      data: { peluangId, userId: user.id, catatan, status: "diajukan" },
    });
    aplikasiId = created.id;
  } catch {
    return failTo(back, "Anda sudah mengirim minat ke peluang ini.");
  }
  await notifyOperator({
    kind: "apply",
    judul: `Apply kerja: ${user.name} → ${peluang.judul}`,
    detail: catatan,
    linkPath: `/kerja/${peluangId}`,
    mitraWa: (
      await prisma.mitraProfile.findUnique({ where: { userId: user.id } })
    )?.wa,
    refType: "aplikasi",
    refId: aplikasiId,
    actorUserId: user.id,
  });
  await onAplikasiBaru(prisma, {
    applicantId: user.id,
    applicantName: user.name,
    peluangId,
    peluangJudul: peluang.judul,
  });
  revalidatePath(`/kerja/${peluangId}`);
  revalidatePath("/kerja");
  revalidatePath("/ringkasan");
  revalidatePath("/pipeline");
  redirect(back + "?ok=" + encodeURIComponent("Minat terkirim."));
}

export async function createListingAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user || user.role !== "mitra")
    return failTo("/komoditi", "Tidak diizinkan.");
  if (user.mitraStatus === "ditolak" || user.mitraStatus === "ditangguhkan")
    return failTo(
      "/komoditi",
      "Akun ditolak/ditangguhkan tidak dapat membuat listing baru."
    );
  if (user.mitraStatus !== "terverifikasi")
    return failTo("/komoditi", "Listing baru hanya untuk mitra terverifikasi.");
  const nama = String(formData.get("nama") || "").trim();
  const kategori = String(formData.get("kategori") || "").trim();
  const volume = String(formData.get("volume") || "").trim();
  const hargaIndikatif = String(formData.get("hargaIndikatif") || "").trim() || null;
  const asal = String(formData.get("asal") || "").trim();
  const tujuan = String(formData.get("tujuan") || "").trim();
  const catatan = String(formData.get("catatan") || "").trim() || null;
  const status = String(formData.get("status") || "draft") as "draft" | "aktif";
  if (!nama || !kategori || !volume || !asal || !tujuan)
    return failTo("/komoditi", "Lengkapi data listing.");
  await prisma.listingKomoditi.create({
    data: {
      pemilikId: user.id,
      nama,
      kategori,
      volume,
      hargaIndikatif,
      asal,
      tujuan,
      catatan,
      status: status === "aktif" ? "aktif" : "draft",
    },
  });
  await onListingBaru(prisma, {
    ownerId: user.id,
    ownerName: user.name,
    nama,
    status: status === "aktif" ? "aktif" : "draft",
  });
  revalidatePath("/komoditi");
  redirect("/komoditi?ok=" + encodeURIComponent("Listing disimpan."));
}

export async function minatKomoditiAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user) return failTo("/masuk", "Login dulu.");
  const listingId = String(formData.get("listingId") || "");
  const catatan = String(formData.get("catatan") || "").trim() || null;
  const listing = await prisma.listingKomoditi.findUnique({ where: { id: listingId } });
  if (!listing || listing.status !== "aktif")
    return failTo("/komoditi", "Listing tidak aktif.");
  let minatId = "";
  try {
    const created = await prisma.minatKomoditi.create({
      data: { listingId, userId: user.id, catatan },
    });
    minatId = created.id;
  } catch {
    return failTo("/komoditi", "Anda sudah menandai tertarik.");
  }
  const mitra = await prisma.mitraProfile.findUnique({ where: { userId: user.id } });
  await notifyOperator({
    kind: "minat",
    judul: `Minat komoditi: ${user.name} → ${listing.nama}`,
    detail: catatan || "(tanpa catatan)",
    linkPath: "/komoditi",
    mitraWa: mitra?.wa,
    refType: "minat",
    refId: minatId,
    actorUserId: user.id,
  });
  revalidatePath("/komoditi");
  revalidatePath("/ringkasan");
  revalidatePath("/pipeline");
  redirect("/komoditi?ok=" + encodeURIComponent("Minat tercatat."));
}

export async function dampinganAction(formData: FormData) {
  const peluangId = String(formData.get("peluangId") || "");
  const back = peluangId ? `/pemerintahan/${peluangId}` : "/pemerintahan";
  const user = await getSessionUser();
  if (!user || user.role !== "mitra")
    return failTo(back, "Tidak diizinkan.");
  const catatan = String(formData.get("catatan") || "").trim();
  const checked = formData.get("disclaimer") === "on";
  if (!checked)
    return failTo(
      back,
      "Centang pernyataan pemahaman sebelum meminta dampingan."
    );
  if (!catatan) return failTo(back, "Isi catatan permintaan.");
  let dampId = "";
  try {
    const created = await prisma.dampingan.create({
      data: {
        peluangId,
        userId: user.id,
        catatan,
        disclaimerCheckedAt: new Date(),
      },
    });
    dampId = created.id;
  } catch {
    return failTo(back, "Anda sudah meminta dampingan untuk item ini.");
  }
  const peluangGov = await prisma.peluangPemerintahan.findUnique({
    where: { id: peluangId },
  });
  const mitra = await prisma.mitraProfile.findUnique({ where: { userId: user.id } });
  await notifyOperator({
    kind: "dampingan",
    judul: `Dampingan: ${user.name} → ${peluangGov?.judul || peluangId}`,
    detail: catatan,
    linkPath: `/pemerintahan/${peluangId}`,
    mitraWa: mitra?.wa,
    refType: "dampingan",
    refId: dampId,
    actorUserId: user.id,
  });
  revalidatePath(`/pemerintahan/${peluangId}`);
  revalidatePath("/ringkasan");
  revalidatePath("/pipeline");
  redirect(back + "?ok=" + encodeURIComponent("Permintaan dampingan terkirim."));
}

export async function movePipelineAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user || (user.role !== "admin" && user.role !== "operator"))
    return failTo("/ringkasan", "Tidak diizinkan.");
  const id = String(formData.get("id") || "");
  const kolom = String(formData.get("kolom") || "") as
    | "baru"
    | "ditinjau"
    | "dihubungi"
    | "tersalurkan"
    | "tidak_cocok";
  const allowed = ["baru", "ditinjau", "dihubungi", "tersalurkan", "tidak_cocok"];
  if (!allowed.includes(kolom)) return failTo("/pipeline", "Kolom tidak valid.");
  await prisma.pipelineCard.update({
    where: { id },
    data: { kolom, updatedById: user.id },
  });
  revalidatePath("/pipeline");
  return ok();
}

export async function createPeluangKerjaAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user || (user.role !== "admin" && user.role !== "operator"))
    return failTo("/admin", "Tidak diizinkan.");
  const judul = String(formData.get("judul") || "").trim();
  const deskripsi = String(formData.get("deskripsi") || "").trim();
  const lokasi = String(formData.get("lokasi") || "").trim();
  const jenis = String(formData.get("jenis") || "").trim();
  const deadlineRaw = String(formData.get("deadline") || "").trim();
  if (!judul || !deskripsi || !lokasi || !jenis)
    return failTo("/admin", "Lengkapi data.");
  await prisma.peluangKerja.create({
    data: {
      judul,
      deskripsi,
      lokasi,
      jenis,
      deadline: deadlineRaw ? new Date(deadlineRaw) : null,
      status: "buka",
    },
  });
  revalidatePath("/kerja");
  revalidatePath("/admin");
  redirect("/admin?ok=" + encodeURIComponent("Peluang kerja dibuat."));
}

export async function createGovAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user || (user.role !== "admin" && user.role !== "operator"))
    return failTo("/admin", "Tidak diizinkan.");
  const judul = String(formData.get("judul") || "").trim();
  const ringkasan = String(formData.get("ringkasan") || "").trim();
  const sumberInfo = String(formData.get("sumberInfo") || "").trim();
  const tanggal = String(formData.get("tanggal") || "").trim();
  const inaprocUrl = String(formData.get("inaprocUrl") || "").trim() || null;
  if (!judul || !ringkasan || !sumberInfo || !tanggal)
    return failTo("/admin", "Lengkapi data.");
  await prisma.peluangPemerintahan.create({
    data: {
      judul,
      ringkasan,
      sumberInfo,
      tanggal: new Date(tanggal),
      inaprocUrl,
      status: "aktif",
    },
  });
  revalidatePath("/pemerintahan");
  revalidatePath("/admin");
  redirect("/admin?ok=" + encodeURIComponent("Item pemerintahan dibuat."));
}

export async function markNotificationReadAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user) return failTo("/masuk", "Login dulu.");
  const id = String(formData.get("id") || "");
  const go = String(formData.get("go") || "");
  if (id) await markRead(prisma, user.id, id);
  revalidatePath("/notifikasi", "layout");
  if (go.startsWith("/") && !go.startsWith("//")) redirect(go);
  return ok();
}

export async function markAllNotificationsReadAction() {
  const user = await getSessionUser();
  if (!user) return failTo("/masuk", "Login dulu.");
  await markAllRead(prisma, user.id);
  revalidatePath("/notifikasi", "layout");
  redirect("/notifikasi?ok=" + encodeURIComponent("Semua notifikasi ditandai sudah dibaca."));
}
