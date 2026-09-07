import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const DEMO = "NexusDemo2026!";

async function main() {
  await prisma.operatorNotice.deleteMany();
  await prisma.dampingan.deleteMany();
  await prisma.minatKomoditi.deleteMany();
  await prisma.aplikasi.deleteMany();
  await prisma.pipelineCard.deleteMany();
  await prisma.listingKomoditi.deleteMany();
  await prisma.peluangPemerintahan.deleteMany();
  await prisma.peluangKerja.deleteMany();
  await prisma.mitraProfile.deleteMany();
  await prisma.user.deleteMany();

  const hash = await bcrypt.hash(DEMO, 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@pnc.nexus",
      name: "Admin PNC Nexus",
      role: "admin",
      passwordHash: hash,
    },
  });

  const ops = await prisma.user.create({
    data: {
      email: "ops@pnc.nexus",
      name: "Sari Wulandari (Ops)",
      role: "operator",
      passwordHash: hash,
    },
  });

  const budi = await prisma.user.create({
    data: {
      email: "budi.wait@demo.nexus",
      name: "Budi Santoso",
      role: "mitra",
      passwordHash: hash,
      mitraProfile: {
        create: {
          tipe: "individu",
          nama: "Budi Santoso",
          kota: "Yogyakarta",
          provinsi: "DIY",
          wa: "0812-1000-0001",
          deskripsi: "Tukang las & fabrikasi ringan",
          jalurKerja: true,
          status: "menunggu_verifikasi",
          onboardingDone: true,
        },
      },
    },
  });

  const rina = await prisma.user.create({
    data: {
      email: "rina.kerja@demo.nexus",
      name: "Rina Kusuma",
      role: "mitra",
      passwordHash: hash,
      mitraProfile: {
        create: {
          tipe: "badan",
          nama: "CV Rina Teknik Mandiri",
          kota: "Semarang",
          provinsi: "Jawa Tengah",
          wa: "0813-2000-0002",
          deskripsi: "Kontraktor MEP & maintenance pabrik",
          jalurKerja: true,
          jalurPemerintahan: true,
          status: "terverifikasi",
          onboardingDone: true,
        },
      },
    },
  });

  const agus = await prisma.user.create({
    data: {
      email: "agus.komoditi@demo.nexus",
      name: "Agus Makmur",
      role: "mitra",
      passwordHash: hash,
      mitraProfile: {
        create: {
          tipe: "badan",
          nama: "UD Agus Makmur Niaga",
          kota: "Surabaya",
          provinsi: "Jawa Timur",
          wa: "0814-3000-0003",
          deskripsi: "Pedagang beras & rempah; minat ekspor terbatas",
          jalurKomoditi: true,
          status: "terverifikasi",
          onboardingDone: true,
        },
      },
    },
  });

  const k1 = await prisma.peluangKerja.create({
    data: {
      judul: "Teknisi maintenance mekanikal — shift siang",
      jenis: "Kontrak proyek / tenaga ahli",
      lokasi: "Semarang, Jawa Tengah",
      deadline: new Date("2026-09-30"),
      status: "buka",
      deskripsi:
        "Mitra pabrik membutuhkan teknisi berpengalaman preventive maintenance conveyor & pompa. Pengalaman ≥2 tahun.\n\nLowongan dari mitra jaringan — bukan lembaga penempatan resmi; perekrutan oleh pemberi kerja.",
    },
  });

  await prisma.peluangKerja.create({
    data: {
      judul: "Tim fabrikasi & pasang kanopi gudang",
      jenis: "Paket pekerjaan kontraktor kecil",
      lokasi: "Sleman, DIY",
      deadline: new Date("2026-10-15"),
      status: "buka",
      deskripsi:
        "Kebutuhan weld + pasang ±120 m² kanopi. Sertakan estimasi durasi di minat.\n\nLowongan dari mitra jaringan — bukan lembaga penempatan resmi; perekrutan oleh pemberi kerja.",
    },
  });

  await prisma.peluangKerja.create({
    data: {
      judul: "Supervisor lapangan (ditutup)",
      jenis: "Kontrak singkat",
      lokasi: "Jakarta",
      status: "tutup",
      deskripsi: "Contoh peluang ditutup untuk uji badge status.",
    },
  });

  const app1 = await prisma.aplikasi.create({
    data: {
      peluangId: k1.id,
      userId: rina.id,
      catatan: "Siap survey lokasi minggu ini.",
      status: "diajukan",
    },
  });

  const c1 = await prisma.listingKomoditi.create({
    data: {
      pemilikId: agus.id,
      nama: "Beras medium premium",
      kategori: "Pangan / beras",
      volume: "20 ton / bulan",
      hargaIndikatif: "Rp 12.500 / kg",
      asal: "Ngawi, Jawa Timur",
      tujuan: "Jakarta & Bandung",
      status: "aktif",
      catatan: "Kadar air & spesifikasi dilampirkan saat nego antar pihak.",
    },
  });

  await prisma.listingKomoditi.create({
    data: {
      pemilikId: agus.id,
      nama: "Lada hitam whole (black pepper)",
      kategori: "Rempah / ekspor",
      volume: "5 ton / shipment",
      hargaIndikatif: "USD 6.8 / kg indikatif FOB Surabaya",
      asal: "Bangka",
      tujuan: "Buyer minat (Malaysia / Vietnam — penjajakan)",
      status: "aktif",
      catatan:
        "Legalitas ekspor & kontrak jadi tanggung jawab para pihak; Nexus hanya koneksi.",
    },
  });

  await prisma.listingKomoditi.create({
    data: {
      pemilikId: agus.id,
      nama: "Draft jagung pakan (uji visibility)",
      kategori: "Pakan",
      volume: "10 ton",
      asal: "Jatim",
      tujuan: "Jabar",
      status: "draft",
      catatan: "Hanya pemilik+admin yang melihat draft.",
    },
  });

  await prisma.minatKomoditi.create({
    data: {
      listingId: c1.id,
      userId: rina.id,
      catatan: "Tertarik untuk uji antrian.",
    },
  });

  await prisma.peluangPemerintahan.create({
    data: {
      judul: "Info: peluang jasa konstruksi gedung — pantau portal resmi",
      ringkasan:
        "Tim mencatat ada kebutuhan jasa konstruksi di wilayah Jateng yang diumumkan publik. Mitra disarankan cek paket di portal resmi.",
      sumberInfo: "Catatan operator dari pengumuman publik (teks bebas)",
      tanggal: new Date("2026-09-01"),
      status: "aktif",
      inaprocUrl: "https://inaproc.id",
    },
  });

  const g2 = await prisma.peluangPemerintahan.create({
    data: {
      judul: "Checklist kapasitas: NIB, legalitas, pengalaman sejenis",
      ringkasan:
        "Dampingan internal menyiapkan kelengkapan usaha sebelum mitra memutuskan ikut proses di sistem pemerintah.",
      sumberInfo: "Tim internal PNC Nexus",
      tanggal: new Date("2026-09-05"),
      status: "aktif",
    },
  });

  const damp = await prisma.dampingan.create({
    data: {
      peluangId: g2.id,
      userId: rina.id,
      catatan: "Butuh review kelengkapan NIB & daftar pengalaman.",
      disclaimerCheckedAt: new Date(),
    },
  });

  await prisma.pipelineCard.createMany({
    data: [
      {
        judul: "Mitra baru: Budi Santoso",
        kolom: "baru",
        refType: "mitra",
        refId: budi.id,
        catatan: "Menunggu verifikasi",
        updatedById: ops.id,
      },
      {
        judul: "Aplikasi: Rina → K1 maintenance",
        kolom: "ditinjau",
        refType: "aplikasi",
        refId: app1.id,
        catatan: "Ops review CV",
        updatedById: ops.id,
      },
      {
        judul: "Minat komoditi: Rina → Beras C1",
        kolom: "dihubungi",
        refType: "minat",
        refId: c1.id,
        catatan: "WA dijadwalkan",
        updatedById: ops.id,
      },
      {
        judul: "Dampingan: Rina → G2 kapasitas",
        kolom: "tersalurkan",
        refType: "dampingan",
        refId: damp.id,
        catatan: "Intro ke mentor internal selesai",
        updatedById: admin.id,
      },
      {
        judul: "Lead tidak cocok (contoh)",
        kolom: "tidak_cocok",
        catatan: "Diluar cakupan jalur",
        updatedById: ops.id,
      },
    ],
  });

  console.log("Seed OK. Demo password:", DEMO);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
