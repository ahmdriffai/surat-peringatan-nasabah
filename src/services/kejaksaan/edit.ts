"use server";

import {
  KepalaKejaksaanInput,
  KepalaKejaksaanInputSchema,
} from "@/features/kejaksaan/schema";
import { KepalaKejaksaan } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export async function editKepalaKejaksaan(
  id: string,
  input: KepalaKejaksaanInput,
): Promise<KepalaKejaksaan> {
  await requireRole("ADMIN");
  const data = KepalaKejaksaanInputSchema.parse(input);

  return prisma.kepalaKejaksaan.update({
    where: { id },
    data,
  });
}
