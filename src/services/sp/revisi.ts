"use server";

import { SuratPeringatan } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export async function revisiSP(id: string): Promise<SuratPeringatan> {
  await requireSession();

  return prisma.$transaction(async (tx) => {
    await tx.sPApproval.deleteMany({ where: { spId: id } });

    return tx.suratPeringatan.update({
      where: { id },
      data: { status: "DRAFT" },
    });
  });
}
