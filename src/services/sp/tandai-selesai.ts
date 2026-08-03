"use server";

import { SuratPeringatan } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { saveUploadedImage } from "@/lib/upload";

export async function tandaiSelesai(
  id: string,
  buktiTandaTerima?: File,
): Promise<SuratPeringatan> {
  await requireSession();
  let buktiTandaTerimaUrl: string | null = null;
  if (buktiTandaTerima && buktiTandaTerima.size > 0) {
    buktiTandaTerimaUrl = await saveUploadedImage(
      buktiTandaTerima,
      "bukti-tanda-terima",
    );
  }

  return prisma.suratPeringatan.update({
    where: { id },
    data: { status: "SELESAI", buktiTandaTerima: buktiTandaTerimaUrl },
  });
}
