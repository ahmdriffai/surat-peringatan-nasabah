-- CreateEnum
CREATE TYPE "JenisSP" AS ENUM ('SP1', 'SP2', 'SP3');

-- CreateEnum
CREATE TYPE "StatusSP" AS ENUM ('DRAFT', 'MENUNGGU_APPROVAL', 'DISETUJUI', 'DITOLAK', 'TERKIRIM', 'SELESAI');

-- CreateEnum
CREATE TYPE "MetodePengiriman" AS ENUM ('POS', 'EMAIL', 'LANGSUNG');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PETUGAS', 'ATASAN');

-- CreateTable
CREATE TABLE "nasabah" (
    "id" TEXT NOT NULL,
    "cif" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "nik" TEXT NOT NULL,
    "nomorRekening" TEXT NOT NULL,
    "email" TEXT,
    "telepon" TEXT,
    "alamat" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nasabah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'PETUGAS',
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surat_peringatan" (
    "id" TEXT NOT NULL,
    "nomorSurat" TEXT NOT NULL,
    "nasabahId" TEXT NOT NULL,
    "hariKeterlambatan" INTEGER NOT NULL,
    "jenis" "JenisSP" NOT NULL,
    "alasan" TEXT NOT NULL,
    "tanggalSurat" TIMESTAMP(3) NOT NULL,
    "tanggalJatuhTempo" TIMESTAMP(3) NOT NULL,
    "status" "StatusSP" NOT NULL DEFAULT 'DRAFT',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "catatanApproval" TEXT,
    "tanggalKirim" TIMESTAMP(3),
    "metodePengiriman" "MetodePengiriman",
    "noResi" TEXT,
    "buktiKirim" TEXT,
    "buktiTandaTerima" TEXT,
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "surat_peringatan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "nasabah_cif_key" ON "nasabah"("cif");

-- CreateIndex
CREATE UNIQUE INDEX "nasabah_nik_key" ON "nasabah"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "nasabah_nomorRekening_key" ON "nasabah"("nomorRekening");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "surat_peringatan_nomorSurat_key" ON "surat_peringatan"("nomorSurat");

-- AddForeignKey
ALTER TABLE "surat_peringatan" ADD CONSTRAINT "surat_peringatan_nasabahId_fkey" FOREIGN KEY ("nasabahId") REFERENCES "nasabah"("id") ON DELETE CASCADE ON UPDATE CASCADE;
