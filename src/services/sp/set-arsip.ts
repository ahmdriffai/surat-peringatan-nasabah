"use server";

import { SuratPeringatan } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { saveUploadedPdf } from "@/lib/upload";

export async function setArsipSP(
  id: string,
  file: File,
): Promise<SuratPeringatan> {
  await requireSession();
  const arsipPdf = await saveUploadedPdf(file, "arsip-surat");

  return prisma.suratPeringatan.update({
    where: { id },
    data: { arsipPdf },
  });
}
