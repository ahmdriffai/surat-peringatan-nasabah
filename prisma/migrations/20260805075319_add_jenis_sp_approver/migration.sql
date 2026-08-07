-- CreateTable
CREATE TABLE "jenis_sp_approver" (
    "id" TEXT NOT NULL,
    "jenis" "JenisSP" NOT NULL,
    "approverId" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jenis_sp_approver_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "jenis_sp_approver_jenis_approverId_key" ON "jenis_sp_approver"("jenis", "approverId");

-- CreateIndex
CREATE UNIQUE INDEX "jenis_sp_approver_jenis_urutan_key" ON "jenis_sp_approver"("jenis", "urutan");

-- AddForeignKey
ALTER TABLE "jenis_sp_approver" ADD CONSTRAINT "jenis_sp_approver_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
