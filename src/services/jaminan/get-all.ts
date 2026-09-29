"use server";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export type JaminanWithDetails = Prisma.JaminanPinjamanGetPayload<{
  include: {
    nasabah: true;
    mutasi: { include: { dicatatOleh: true }; orderBy: { terjadiPada: "desc" } };
  };
}>;

export async function getAllJaminan(): Promise<JaminanWithDetails[]> {
  await requireSession();

  return prisma.jaminanPinjaman.findMany({
    include: {
      nasabah: true,
      mutasi: {
        include: { dicatatOleh: true },
        orderBy: { terjadiPada: "desc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}
