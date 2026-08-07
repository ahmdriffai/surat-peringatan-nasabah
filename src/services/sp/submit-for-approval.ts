"use server";

import { SuratPeringatan } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export async function submitForApproval(id: string): Promise<SuratPeringatan> {
  await requireSession();

  return prisma.$transaction(async (tx) => {
    const sp = await tx.suratPeringatan.findUniqueOrThrow({ where: { id } });

    const rules = await tx.jenisSPApprover.findMany({
      where: { jenis: sp.jenis, approver: { aktif: true } },
      orderBy: { urutan: "asc" },
    });

    if (rules.length === 0) {
      throw new Error(
        "Belum ada approver yang diatur untuk jenis surat ini. Hubungi admin.",
      );
    }

    await tx.sPApproval.deleteMany({ where: { spId: id } });
    await tx.sPApproval.createMany({
      data: rules.map((rule, index) => ({
        spId: id,
        approverId: rule.approverId,
        urutan: index + 1,
      })),
    });

    return tx.suratPeringatan.update({
      where: { id },
      data: { status: "MENUNGGU_APPROVAL" },
    });
  });
}
