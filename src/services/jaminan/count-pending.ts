"use server";

import { prisma } from "@/lib/prisma";
import { requireJaminanApproval } from "@/lib/session";

export async function countPendingJaminanApprovals() {
  const session = await requireJaminanApproval();

  return prisma.jaminanApproval.count({
    where: { approverId: session.user.id, status: "PENDING" },
  });
}
