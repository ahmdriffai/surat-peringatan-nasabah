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

  const count = await tx.suratPeringatan.count({
    where: {
      jenis,
      createdAt: {
        gte: new Date(tahun, now.getMonth(), 1),
        lt: new Date(tahun, now.getMonth() + 1, 1),
      },
    },
  });

  const urutan = count + 1;
  const bulanRomawi = ROMAN_MONTHS[now.getMonth()];
  return `${urutan}/${KODE_CABANG}/${JENIS_PREFIX[jenis]}/${bulanRomawi}/${tahun}`;
}

export async function approveSP(
  id: string,
  input: ApproveSPInput,
): Promise<SuratPeringatan> {
  const session = await requireRole("APPROVER");
  const data = ApproveSPInputSchema.parse(input);

  return prisma.$transaction(async (tx) => {
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
  });
}
