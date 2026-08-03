-- AlterTable
ALTER TABLE "surat_peringatan" ADD COLUMN     "biayaAdministrasi" DOUBLE PRECISION,
ADD COLUMN     "jenisFasilitas" TEXT,
ADD COLUMN     "sukuBunga" DOUBLE PRECISION,
ADD COLUMN     "tanggalAkadKredit" TIMESTAMP(3);

