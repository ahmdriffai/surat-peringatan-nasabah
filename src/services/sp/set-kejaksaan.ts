"use server";

import { SuratPeringatan } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export async function setKejaksaanSP(
  id: string,
  kejaksaanId: string,
): Promise<SuratPeringatan> {
  await requireSession();

  return prisma.suratPeringatan.update({
    where: { id },
    data: { kejaksaanId },
  });
}
