-- CreateEnum
CREATE TYPE "ArahJaminan" AS ENUM ('MASUK', 'KELUAR');

-- CreateEnum
CREATE TYPE "StatusJaminan" AS ENUM ('TERSIMPAN', 'DIBAWA_KELUAR');

-- CreateTable
CREATE TABLE "jaminan_pinjaman" (
    "id" TEXT NOT NULL,
    "nasabahId" TEXT NOT NULL,
    "noPjm" TEXT NOT NULL,
    "jenis" TEXT NOT NULL,
    "nomorDokumen" TEXT,
    "deskripsi" TEXT,
    "atasNama" TEXT,
    "nilaiTaksiran" DOUBLE PRECISION,
    "lokasiPenyimpanan" TEXT,
    "status" "StatusJaminan" NOT NULL DEFAULT 'TERSIMPAN',
    "tanggalDiterima" TIMESTAMP(3),
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jaminan_pinjaman_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mutasi_jaminan" (
    "id" TEXT NOT NULL,
    "jaminanId" TEXT NOT NULL,
    "arah" "ArahJaminan" NOT NULL,
    "terjadiPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dicatatOlehId" TEXT NOT NULL,
    "diserahkanKepada" TEXT,
    "diterimaDari" TEXT,
    "keperluan" TEXT,
    "lokasi" TEXT,
    "bukti" TEXT,
    "tanggalKembaliRencana" TIMESTAMP(3),
    "tanggalKembali" TIMESTAMP(3),
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mutasi_jaminan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "jaminan_pinjaman_nasabahId_idx" ON "jaminan_pinjaman"("nasabahId");

-- CreateIndex
CREATE INDEX "jaminan_pinjaman_noPjm_idx" ON "jaminan_pinjaman"("noPjm");

-- CreateIndex
CREATE INDEX "mutasi_jaminan_jaminanId_terjadiPada_idx" ON "mutasi_jaminan"("jaminanId", "terjadiPada");

-- CreateIndex
CREATE INDEX "mutasi_jaminan_dicatatOlehId_idx" ON "mutasi_jaminan"("dicatatOlehId");

-- AddForeignKey
ALTER TABLE "jaminan_pinjaman" ADD CONSTRAINT "jaminan_pinjaman_nasabahId_fkey" FOREIGN KEY ("nasabahId") REFERENCES "nasabah"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mutasi_jaminan" ADD CONSTRAINT "mutasi_jaminan_jaminanId_fkey" FOREIGN KEY ("jaminanId") REFERENCES "jaminan_pinjaman"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mutasi_jaminan" ADD CONSTRAINT "mutasi_jaminan_dicatatOlehId_fkey" FOREIGN KEY ("dicatatOlehId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
