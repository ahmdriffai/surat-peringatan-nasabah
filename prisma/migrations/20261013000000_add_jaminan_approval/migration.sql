ALTER TABLE "users" ADD COLUMN "petugasJaminan" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "jaminan_approval" (
    "id" TEXT NOT NULL,
    "mutasiId" TEXT NOT NULL,
    "approverId" TEXT NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "catatan" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "jaminan_approval_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "jaminan_approval_mutasiId_key" ON "jaminan_approval"("mutasiId");
CREATE INDEX "jaminan_approval_approverId_status_idx" ON "jaminan_approval"("approverId", "status");
ALTER TABLE "jaminan_approval" ADD CONSTRAINT "jaminan_approval_mutasiId_fkey" FOREIGN KEY ("mutasiId") REFERENCES "mutasi_jaminan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "jaminan_approval" ADD CONSTRAINT "jaminan_approval_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
