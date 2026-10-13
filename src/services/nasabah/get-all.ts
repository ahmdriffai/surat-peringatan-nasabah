"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export type NasabahWithPinjaman = Prisma.NasabahGetPayload<{
  include: { pinjaman: true };
}>;

export async function getAllNasabah(): Promise<NasabahWithPinjaman[]> {
  return prisma.nasabah.findMany({
    include: { pinjaman: { orderBy: { updatedAt: "desc" } } },
    orderBy: { createdAt: "desc" },
  });
}
