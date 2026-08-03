"use server";

import { SPWithNasabah } from "@/features/sp/schema";
import { prisma } from "@/lib/prisma";

export async function getAllSP(): Promise<SPWithNasabah[]> {
  return prisma.suratPeringatan.findMany({
    include: {
      nasabah: true,
      kejaksaan: true,
      approvals: { include: { approver: true }, orderBy: { urutan: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });
}
