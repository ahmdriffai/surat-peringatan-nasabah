"use server";

import { JaminanPinjaman } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireJaminanAccess } from "@/lib/session";

export async function deleteJaminan(id: string): Promise<JaminanPinjaman> {
  await requireJaminanAccess();
  return prisma.jaminanPinjaman.delete({ where: { id } });
}
