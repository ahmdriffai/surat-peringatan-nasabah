"use server";

import {
  TandaiTerkirimInput,
  TandaiTerkirimInputSchema,
} from "@/features/sp/schema";
import { SuratPeringatan } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { saveUploadedImage } from "@/lib/upload";

export async function tandaiTerkirim(
  id: string,
  input: TandaiTerkirimInput,
  buktiKirim?: File,
): Promise<SuratPeringatan> {
  await requireSession();
  const data = TandaiTerkirimInputSchema.parse(input);

  let buktiKirimUrl: string | null = null;
  if (buktiKirim && buktiKirim.size > 0) {
    buktiKirimUrl = await saveUploadedImage(buktiKirim, "bukti-kirim");
  }

  return prisma.suratPeringatan.update({
    where: { id },
    data: {
      status: "TERKIRIM",
      metodePengiriman: data.metodePengiriman,
      tanggalKirim: data.tanggalKirim,
      noResi: data.noResi || null,
      buktiKirim: buktiKirimUrl,
    },
  });
}
