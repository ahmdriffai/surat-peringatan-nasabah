"use server";

import { prisma } from "@/lib/prisma";
import { Nasabah } from "@/generated/prisma/client";

export async function getAllNasabah(): Promise<Nasabah[]> {
  return prisma.nasabah.findMany({
    orderBy: { createdAt: "desc" },
  });
}
