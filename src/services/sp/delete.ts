"use server";

import { SuratPeringatan } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export async function deleteSP(id: string): Promise<SuratPeringatan> {
  await requireSession();

  return prisma.suratPeringatan.delete({
    where: { id },
  });
}
