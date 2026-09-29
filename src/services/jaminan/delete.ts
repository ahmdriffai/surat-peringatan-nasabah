"use server";

import { JaminanPinjaman } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export async function deleteJaminan(id: string): Promise<JaminanPinjaman> {
  await requireSession();
  return prisma.jaminanPinjaman.delete({ where: { id } });
}
