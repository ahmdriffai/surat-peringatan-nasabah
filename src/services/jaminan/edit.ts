"use server";

import {
  JaminanEditInput,
  JaminanEditInputSchema,
} from "@/features/jaminan/schema";
import { JaminanPinjaman } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export async function editJaminan(
  id: string,
  input: JaminanEditInput,
): Promise<JaminanPinjaman> {
  await requireSession();
  const data = JaminanEditInputSchema.parse(input);

  return prisma.jaminanPinjaman.update({
    where: { id },
    data: {
      ...data,
      nomorDokumen: data.nomorDokumen || null,
      deskripsi: data.deskripsi || null,
      atasNama: data.atasNama || null,
      lokasiPenyimpanan: data.lokasiPenyimpanan || null,
      catatan: data.catatan || null,
    },
  });
}
