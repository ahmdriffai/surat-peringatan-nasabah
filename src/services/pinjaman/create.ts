"use server";

import { PinjamanCreateInput, PinjamanCreateInputSchema } from "@/features/pinjaman/schema";
import { Pinjaman } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export async function createPinjaman(
  nasabahId: string,
  input: PinjamanCreateInput,
): Promise<Pinjaman> {
  await requireSession();
  const data = PinjamanCreateInputSchema.parse(input);

  return prisma.pinjaman.upsert({
    where: { nasabahId_noPjm: { nasabahId, noPjm: data.noPjm } },
    create: { nasabahId, ...data },
    update: data,
  });
}
