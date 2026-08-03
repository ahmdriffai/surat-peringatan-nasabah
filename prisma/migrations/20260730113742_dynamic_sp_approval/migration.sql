-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'DISETUJUI', 'DITOLAK');

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('PETUGAS', 'APPROVER', 'ADMIN');
ALTER TABLE "public"."users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'PETUGAS';
COMMIT;

-- AlterTable
ALTER TABLE "surat_peringatan" DROP COLUMN "approvedAt",
DROP COLUMN "approvedBy",
DROP COLUMN "catatanApproval",
ALTER COLUMN "nomorSurat" DROP NOT NULL;

-- CreateTable
CREATE TABLE "sp_approval" (
    "id" TEXT NOT NULL,
    "spId" TEXT NOT NULL,
    "approverId" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "catatan" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sp_approval_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sp_approval_spId_approverId_key" ON "sp_approval"("spId", "approverId");

-- CreateIndex
CREATE UNIQUE INDEX "sp_approval_spId_urutan_key" ON "sp_approval"("spId", "urutan");

-- AddForeignKey
ALTER TABLE "sp_approval" ADD CONSTRAINT "sp_approval_spId_fkey" FOREIGN KEY ("spId") REFERENCES "surat_peringatan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sp_approval" ADD CONSTRAINT "sp_approval_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

