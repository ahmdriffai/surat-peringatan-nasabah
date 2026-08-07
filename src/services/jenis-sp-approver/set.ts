"use server";

import {
  SetJenisSPApproverInput,
  SetJenisSPApproverInputSchema,
} from "@/features/jenis-sp-approver/schema";
import { JenisSPApprover } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export async function setJenisSPApprovers(
  input: SetJenisSPApproverInput,
): Promise<JenisSPApprover[]> {
  await requireRole("ADMIN");
  const { jenis, approverIds } = SetJenisSPApproverInputSchema.parse(input);

  return prisma.$transaction(async (tx) => {
    const approvers = await tx.user.findMany({
      where: { id: { in: approverIds }, role: "APPROVER" },
    });

    if (approvers.length !== approverIds.length) {
      throw new Error("Salah satu user yang dipilih bukan approver.");
    }

    await tx.jenisSPApprover.deleteMany({ where: { jenis } });
    await tx.jenisSPApprover.createMany({
      data: approverIds.map((approverId, index) => ({
        jenis,
        approverId,
        urutan: index + 1,
      })),
    });

    return tx.jenisSPApprover.findMany({
      where: { jenis },
      orderBy: { urutan: "asc" },
    });
  });
}
