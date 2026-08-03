/*
  Warnings:

  - You are about to drop the column `hariKeterlambatan` on the `surat_peringatan` table. All the data in the column will be lost.
  - Added the required column `kolektibilitas` to the `surat_peringatan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `noPjm` to the `surat_peringatan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `plafond` to the `surat_peringatan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `saldo` to the `surat_peringatan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tgkBunga` to the `surat_peringatan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tgkBungaHari` to the `surat_peringatan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tgkPokok` to the `surat_peringatan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tgkPokokHari` to the `surat_peringatan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "JenisSP" ADD VALUE 'PEMBERITAHUAN';
ALTER TYPE "JenisSP" ADD VALUE 'PEMBERITAHUAN_SKK';

-- AlterTable
ALTER TABLE "surat_peringatan" DROP COLUMN "hariKeterlambatan",
ADD COLUMN     "kolektibilitas" INTEGER NOT NULL,
ADD COLUMN     "noPjm" TEXT NOT NULL,
ADD COLUMN     "plafond" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "saldo" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "tgkBunga" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "tgkBungaHari" INTEGER NOT NULL,
ADD COLUMN     "tgkPokok" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "tgkPokokHari" INTEGER NOT NULL;
