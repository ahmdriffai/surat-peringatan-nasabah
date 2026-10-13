"use server";

import { ApproveSPInput, ApproveSPInputSchema } from "@/features/sp/schema";
import { JenisSP } from "@/generated/prisma/enums";
import { Prisma, SuratPeringatan } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

const JENIS_PREFIX: Record<JenisSP, string> = {
  PEMBERITAHUAN: "PEMB",
  SP1: "SP1",
  SP2: "SP2",
  SP3: "SP3",
  PEMBERITAHUAN_SKK: "SKK",
  SOMASI_1: "SMS1",
  SOMASI_2: "SMS2",
  SOMASI_3: "SMS3",
  PEMBERITAHUAN_LELANG: "LLG",
};

const KODE_CABANG = "600557";

const ROMAN_MONTHS = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
];

// Format resmi bank: {urutan}/{kode cabang}/{jenis}/{bulan romawi}/{tahun}
// contoh: 1243/600557/SKK/VI/2026
async function generateNomorSurat(
  tx: Prisma.TransactionClient,
  jenis: JenisSP,
): Promise<string> {
  const now = new Date();
  const tahun = now.getFullYear();

  const existing = await tx.suratPeringatan.findMany({
    where: {
      jenis,
      createdAt: {
        gte: new Date(tahun, now.getMonth(), 1),
        lt: new Date(tahun, now.getMonth() + 1, 1),
      },
    },
    select: { nomorSurat: true },
  });

  const urutan = existing.reduce((max, item) => {
    const value = Number.parseInt(item.nomorSurat?.split("/")[0] ?? "0", 10);
    return Number.isNaN(value) ? max : Math.max(max, value);
  }, 0) + 1;
  const bulanRomawi = ROMAN_MONTHS[now.getMonth()];
  return `${urutan}/${KODE_CABANG}/${JENIS_PREFIX[jenis]}/${bulanRomawi}/${tahun}`;
}

export async function approveSP(
  id: string,
  input: ApproveSPInput,
): Promise<SuratPeringatan> {
  const session = await requireRole("APPROVER");
  const data = ApproveSPInputSchema.parse(input);

  const approveTransaction = () => prisma.$transaction(async (tx) => {
    const pending = await tx.sPApproval.findMany({
      where: { spId: id, status: "PENDING" },
      orderBy: { urutan: "asc" },
    });

    const next = pending[0];
    if (!next) {
      throw new Error("Tidak ada approval yang menunggu untuk surat ini.");
    }
    if (next.approverId !== session.user.id) {
      throw new Error("Belum giliran Anda untuk menyetujui surat ini.");
    }

    await tx.sPApproval.update({
      where: { id: next.id },
      data: {
        status: "DISETUJUI",
        catatan: data.catatan || null,
        approvedAt: new Date(),
      },
    });

    if (pending.length > 1) {
      return tx.suratPeringatan.findUniqueOrThrow({ where: { id } });
    }

    const sp = await tx.suratPeringatan.findUniqueOrThrow({ where: { id } });
    const nomorSurat = await generateNomorSurat(tx, sp.jenis);

    return tx.suratPeringatan.update({
      where: { id },
      data: { status: "DISETUJUI", nomorSurat },
    });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

  // Nomor surat harus tetap berurutan, tetapi dua approval terakhir dapat
  // berjalan hampir bersamaan. Ulangi transaksi jika database menolak nomor
  // yang sama akibat race condition.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await approveTransaction();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const isRetryable =
        message.includes("nomorSurat") ||
        (error instanceof Prisma.PrismaClientKnownRequestError &&
          (error.code === "P2002" || error.code === "P2034"));

      if (!isRetryable || attempt === 2) throw error;
    }
  }

  throw new Error("Approval surat gagal diproses. Silakan coba lagi.");
}
