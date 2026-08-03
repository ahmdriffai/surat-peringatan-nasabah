"use server";

import { RejectSPInput, RejectSPInputSchema } from "@/features/sp/schema";
import { SuratPeringatan } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export async function rejectSP(
  id: string,
  input: RejectSPInput,
): Promise<SuratPeringatan> {
  const session = await requireRole("APPROVER");
  const data = RejectSPInputSchema.parse(input);

  return prisma.$transaction(async (tx) => {
    const next = await tx.sPApproval.findFirst({
      where: { spId: id, status: "PENDING" },
      orderBy: { urutan: "asc" },
    });

    if (!next) {
      throw new Error("Tidak ada approval yang menunggu untuk surat ini.");
    }
    if (next.approverId !== session.user.id) {
      throw new Error("Belum giliran Anda untuk menolak surat ini.");
    }

    await tx.sPApproval.update({
      where: { id: next.id },
      data: {
        status: "DITOLAK",
        catatan: data.catatan,
        approvedAt: new Date(),
      },
    });

    return tx.suratPeringatan.update({
      where: { id },
      data: { status: "DITOLAK" },
    });
  });
}
