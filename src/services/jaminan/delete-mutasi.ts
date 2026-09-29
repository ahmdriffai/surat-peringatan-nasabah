"use server";

import { MutasiJaminan } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export async function deleteMutasiJaminan(id: string): Promise<MutasiJaminan> {
  await requireSession();

  return prisma.$transaction(async (tx) => {
    const mutasi = await tx.mutasiJaminan.delete({ where: { id } });
    const lastMutasi = await tx.mutasiJaminan.findFirst({
      where: { jaminanId: mutasi.jaminanId },
      orderBy: { terjadiPada: "desc" },
    });

    await tx.jaminanPinjaman.update({
      where: { id: mutasi.jaminanId },
      data: { status: lastMutasi?.arah === "KELUAR" ? "DIBAWA_KELUAR" : "TERSIMPAN" },
    });

    return mutasi;
  });
}
