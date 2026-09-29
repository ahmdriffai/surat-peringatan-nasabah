"use server";

import {
  MutasiJaminanInput,
  MutasiJaminanInputSchema,
} from "@/features/jaminan/schema";
import { MutasiJaminan } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { saveUploadedEvidence } from "@/lib/upload";

export async function createMutasiJaminan(
  jaminanId: string,
  input: MutasiJaminanInput,
  bukti?: File,
): Promise<MutasiJaminan> {
  const session = await requireSession();
  const data = MutasiJaminanInputSchema.parse(input);
  const buktiUrl = bukti?.size
    ? await saveUploadedEvidence(bukti, "bukti-jaminan")
    : undefined;

  return prisma.$transaction(async (tx) => {
    const mutasi = await tx.mutasiJaminan.create({
      data: {
        jaminanId,
        ...data,
        diserahkanKepada: data.diserahkanKepada || null,
        diterimaDari: data.diterimaDari || null,
        keperluan: data.keperluan || null,
        lokasi: data.lokasi || null,
        catatan: data.catatan || null,
        tanggalKembaliRencana: data.tanggalKembaliRencana ?? null,
        tanggalKembali: data.tanggalKembali ?? null,
        bukti: buktiUrl,
        dicatatOlehId: session.user.id,
      },
    });

    await tx.jaminanPinjaman.update({
      where: { id: jaminanId },
      data: { status: data.arah === "KELUAR" ? "DIBAWA_KELUAR" : "TERSIMPAN" },
    });

    return mutasi;
  });
}
