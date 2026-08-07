"use server";

import { SPWithNasabah } from "@/features/sp/schema";
import { prisma } from "@/lib/prisma";

export async function getDetailSP(id: string): Promise<SPWithNasabah | null> {
  return prisma.suratPeringatan.findUnique({
    where: { id },
    include: {
      nasabah: true,
      kejaksaan: true,
      petugas: true,
      approvals: { include: { approver: true }, orderBy: { urutan: "asc" } },
    },
  });
}
