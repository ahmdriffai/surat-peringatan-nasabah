"use server";

import { KepalaKejaksaan } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export async function deleteKepalaKejaksaan(
  id: string,
): Promise<KepalaKejaksaan> {
  await requireRole("ADMIN");

  return prisma.kepalaKejaksaan.delete({
    where: { id },
  });
}
