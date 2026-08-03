"use server";

import { Nasabah } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export async function deleteNasabah(id: string): Promise<Nasabah> {
  return prisma.nasabah.delete({
    where: { id },
  });
}
