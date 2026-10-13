CREATE TABLE "pinjaman" (
    "id" TEXT NOT NULL,
    "nasabahId" TEXT NOT NULL,
    "noPjm" TEXT NOT NULL,
    "jenisFasilitas" TEXT,
    "tanggalAkadKredit" TIMESTAMP(3),
    "sukuBunga" DOUBLE PRECISION,
    "plafond" DOUBLE PRECISION,
    "saldo" DOUBLE PRECISION,
    "tgkPokok" DOUBLE PRECISION,
    "tgkBunga" DOUBLE PRECISION,
    "tgkPokokHari" INTEGER,
    "tgkBungaHari" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pinjaman_pkey" PRIMARY KEY ("id")
);

INSERT INTO "pinjaman" ("id", "nasabahId", "noPjm", "createdAt", "updatedAt")
SELECT md5("nasabahId" || ':' || "noPjm"), "nasabahId", "noPjm", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (
  SELECT DISTINCT "nasabahId", "noPjm" FROM "surat_peringatan"
  UNION
  SELECT DISTINCT "nasabahId", "noPjm" FROM "jaminan_pinjaman"
) AS sumber;

ALTER TABLE "surat_peringatan" ADD COLUMN "pinjamanId" TEXT;
ALTER TABLE "jaminan_pinjaman" ADD COLUMN "pinjamanId" TEXT;

UPDATE "surat_peringatan" sp
SET "pinjamanId" = p."id"
FROM "pinjaman" p
WHERE p."nasabahId" = sp."nasabahId" AND p."noPjm" = sp."noPjm";

UPDATE "jaminan_pinjaman" j
SET "pinjamanId" = p."id"
FROM "pinjaman" p
WHERE p."nasabahId" = j."nasabahId" AND p."noPjm" = j."noPjm";

CREATE UNIQUE INDEX "pinjaman_nasabahId_noPjm_key" ON "pinjaman"("nasabahId", "noPjm");
CREATE INDEX "pinjaman_noPjm_idx" ON "pinjaman"("noPjm");
CREATE INDEX "surat_peringatan_pinjamanId_idx" ON "surat_peringatan"("pinjamanId");
CREATE INDEX "jaminan_pinjaman_pinjamanId_idx" ON "jaminan_pinjaman"("pinjamanId");
ALTER TABLE "pinjaman" ADD CONSTRAINT "pinjaman_nasabahId_fkey" FOREIGN KEY ("nasabahId") REFERENCES "nasabah"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "surat_peringatan" ADD CONSTRAINT "surat_peringatan_pinjamanId_fkey" FOREIGN KEY ("pinjamanId") REFERENCES "pinjaman"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "jaminan_pinjaman" ADD CONSTRAINT "jaminan_pinjaman_pinjamanId_fkey" FOREIGN KEY ("pinjamanId") REFERENCES "pinjaman"("id") ON DELETE SET NULL ON UPDATE CASCADE;
