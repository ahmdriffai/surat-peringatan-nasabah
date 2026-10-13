"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export async function countPendingJaminanApprovals() {
  const session = await requireSession();
  if (!session.user.petugasJaminan) return 0;

  return prisma.jaminanApproval.count({
    where: { approverId: session.user.id, status: "PENDING" },
  });
}
