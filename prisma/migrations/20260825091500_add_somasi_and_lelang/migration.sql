-- AlterEnum
ALTER TYPE "JenisSP" ADD VALUE 'SOMASI_1';
ALTER TYPE "JenisSP" ADD VALUE 'SOMASI_2';
ALTER TYPE "JenisSP" ADD VALUE 'SOMASI_3';
ALTER TYPE "JenisSP" ADD VALUE 'PEMBERITAHUAN_LELANG';

-- AlterTable surat_peringatan
ALTER TABLE "surat_peringatan" ADD COLUMN "denda" DOUBLE PRECISION;
ALTER TABLE "surat_peringatan" ADD COLUMN "batasWaktuHari" INTEGER;
ALTER TABLE "surat_peringatan" ADD COLUMN "jenisAgunan" TEXT;
ALTER TABLE "surat_peringatan" ADD COLUMN "dokumenAgunan" TEXT;
ALTER TABLE "surat_peringatan" ADD COLUMN "atasNamaAgunan" TEXT;
ALTER TABLE "surat_peringatan" ADD COLUMN "lokasiAgunan" TEXT;
ALTER TABLE "surat_peringatan" ADD COLUMN "nilaiLimitLelang" DOUBLE PRECISION;
ALTER TABLE "surat_peringatan" ADD COLUMN "kpknl" TEXT;
ALTER TABLE "surat_peringatan" ADD COLUMN "tanggalLelang" TIMESTAMP(3);
