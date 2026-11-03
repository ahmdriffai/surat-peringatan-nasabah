ALTER TABLE "jaminan_pinjaman" RENAME COLUMN "nilaiTaksiran" TO "notaris";

ALTER TABLE "jaminan_pinjaman"
  ALTER COLUMN "notaris" TYPE TEXT
  USING "notaris"::TEXT;
