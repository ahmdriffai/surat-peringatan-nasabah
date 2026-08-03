"use server";

import { SPCreateInput, SPCreateInputSchema } from "@/features/sp/schema";
import { SuratPeringatan } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export async function createSP(
  input: SPCreateInput,
): Promise<SuratPeringatan> {
  await requireSession();
  const data = SPCreateInputSchema.parse(input);

  return prisma.suratPeringatan.create({
    data,
  });
}
