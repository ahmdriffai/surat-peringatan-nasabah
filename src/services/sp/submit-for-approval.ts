"use server";

import { SuratPeringatan } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export async function submitForApproval(id: string): Promise<SuratPeringatan> {
  await requireSession();

  return prisma.$transaction(async (tx) => {
    const approvers = await tx.user.findMany({
      where: { role: "APPROVER", aktif: true },
      orderBy: { createdAt: "asc" },
    });

    if (approvers.length === 0) {
      throw new Error("Belum ada user dengan role Approver.");
    }

    await tx.sPApproval.deleteMany({ where: { spId: id } });
    await tx.sPApproval.createMany({
      data: approvers.map((approver, index) => ({
        spId: id,
        approverId: approver.id,
        urutan: index + 1,
      })),
    });

    return tx.suratPeringatan.update({
      where: { id },
      data: { status: "MENUNGGU_APPROVAL" },
    });
  });
}
