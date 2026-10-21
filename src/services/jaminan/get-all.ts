"use server";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireJaminanView } from "@/lib/session";

export type JaminanWithDetails = Prisma.JaminanPinjamanGetPayload<{
  include: {
    nasabah: true;
    pinjaman: true;
    mutasi: { include: { dicatatOleh: true, approval: { include: { approver: true } } }; orderBy: { terjadiPada: "desc" } };
  };
}>;

export async function getAllJaminan(): Promise<JaminanWithDetails[]> {
  await requireJaminanView();

  return prisma.jaminanPinjaman.findMany({
    include: {
      nasabah: true,
      pinjaman: true,
      mutasi: {
        include: { dicatatOleh: true, approval: { include: { approver: true } } },
        orderBy: { terjadiPada: "desc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}
