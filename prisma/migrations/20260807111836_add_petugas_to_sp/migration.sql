-- AlterTable
ALTER TABLE "surat_peringatan" ADD COLUMN     "petugasId" TEXT;

-- AddForeignKey
ALTER TABLE "surat_peringatan" ADD CONSTRAINT "surat_peringatan_petugasId_fkey" FOREIGN KEY ("petugasId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
