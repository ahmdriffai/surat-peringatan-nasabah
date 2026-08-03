-- AlterTable
ALTER TABLE "surat_peringatan" ADD COLUMN     "kejaksaanId" TEXT;

-- CreateTable
CREATE TABLE "kepala_kejaksaan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jabatan" TEXT NOT NULL,
    "pangkat" TEXT,
    "nip" TEXT,
    "alamat" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kepala_kejaksaan_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "surat_peringatan" ADD CONSTRAINT "surat_peringatan_kejaksaanId_fkey" FOREIGN KEY ("kejaksaanId") REFERENCES "kepala_kejaksaan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

