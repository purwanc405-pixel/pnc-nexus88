-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('mitra', 'operator', 'admin');

-- CreateEnum
CREATE TYPE "MitraStatus" AS ENUM ('menunggu_verifikasi', 'terverifikasi', 'ditolak', 'ditangguhkan');

-- CreateEnum
CREATE TYPE "TipeMitra" AS ENUM ('individu', 'badan');

-- CreateEnum
CREATE TYPE "PeluangStatus" AS ENUM ('buka', 'tutup');

-- CreateEnum
CREATE TYPE "AplikasiStatus" AS ENUM ('diajukan', 'ditinjau', 'diterima', 'ditolak');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('draft', 'aktif', 'ditutup');

-- CreateEnum
CREATE TYPE "GovStatus" AS ENUM ('aktif', 'arsip');

-- CreateEnum
CREATE TYPE "PipelineKolom" AS ENUM ('baru', 'ditinjau', 'dihubungi', 'tersalurkan', 'tidak_cocok');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'mitra',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MitraProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tipe" "TipeMitra" NOT NULL,
    "nama" TEXT NOT NULL,
    "kota" TEXT NOT NULL,
    "provinsi" TEXT NOT NULL,
    "wa" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "dokumenPath" TEXT,
    "jalurKerja" BOOLEAN NOT NULL DEFAULT false,
    "jalurKomoditi" BOOLEAN NOT NULL DEFAULT false,
    "jalurPemerintahan" BOOLEAN NOT NULL DEFAULT false,
    "status" "MitraStatus" NOT NULL DEFAULT 'menunggu_verifikasi',
    "onboardingDone" BOOLEAN NOT NULL DEFAULT false,
    "catatanStatus" TEXT,
    "cekProfilLengkap" BOOLEAN NOT NULL DEFAULT false,
    "cekKontakValid" BOOLEAN NOT NULL DEFAULT false,
    "cekJalurSesuai" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MitraProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperatorNotice" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "linkPath" TEXT,
    "mitraWa" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "OperatorNotice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PeluangKerja" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "lokasi" TEXT NOT NULL,
    "jenis" TEXT NOT NULL,
    "deadline" TIMESTAMP(3),
    "status" "PeluangStatus" NOT NULL DEFAULT 'buka',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PeluangKerja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Aplikasi" (
    "id" TEXT NOT NULL,
    "peluangId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "catatan" TEXT NOT NULL,
    "status" "AplikasiStatus" NOT NULL DEFAULT 'diajukan',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Aplikasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingKomoditi" (
    "id" TEXT NOT NULL,
    "pemilikId" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "volume" TEXT NOT NULL,
    "hargaIndikatif" TEXT,
    "asal" TEXT NOT NULL,
    "tujuan" TEXT NOT NULL,
    "catatan" TEXT,
    "status" "ListingStatus" NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ListingKomoditi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MinatKomoditi" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MinatKomoditi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PeluangPemerintahan" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "ringkasan" TEXT NOT NULL,
    "sumberInfo" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "status" "GovStatus" NOT NULL DEFAULT 'aktif',
    "inaprocUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PeluangPemerintahan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dampingan" (
    "id" TEXT NOT NULL,
    "peluangId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "catatan" TEXT NOT NULL,
    "disclaimerCheckedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Dampingan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PipelineCard" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "kolom" "PipelineKolom" NOT NULL DEFAULT 'baru',
    "refType" TEXT,
    "refId" TEXT,
    "catatan" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PipelineCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "MitraProfile_userId_key" ON "MitraProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Aplikasi_peluangId_userId_key" ON "Aplikasi"("peluangId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "MinatKomoditi_listingId_userId_key" ON "MinatKomoditi"("listingId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Dampingan_peluangId_userId_key" ON "Dampingan"("peluangId", "userId");

-- AddForeignKey
ALTER TABLE "MitraProfile" ADD CONSTRAINT "MitraProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aplikasi" ADD CONSTRAINT "Aplikasi_peluangId_fkey" FOREIGN KEY ("peluangId") REFERENCES "PeluangKerja"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aplikasi" ADD CONSTRAINT "Aplikasi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingKomoditi" ADD CONSTRAINT "ListingKomoditi_pemilikId_fkey" FOREIGN KEY ("pemilikId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MinatKomoditi" ADD CONSTRAINT "MinatKomoditi_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "ListingKomoditi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MinatKomoditi" ADD CONSTRAINT "MinatKomoditi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dampingan" ADD CONSTRAINT "Dampingan_peluangId_fkey" FOREIGN KEY ("peluangId") REFERENCES "PeluangPemerintahan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dampingan" ADD CONSTRAINT "Dampingan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PipelineCard" ADD CONSTRAINT "PipelineCard_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

