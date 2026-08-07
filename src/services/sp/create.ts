"use server";

import { SPCreateInput, SPCreateInputSchema } from "@/features/sp/schema";
import { SuratPeringatan } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export async function createSP(
  input: SPCreateInput,
): Promise<SuratPeringatan> {
  const session = await requireSession();

  if (session.user.role === "APPROVER") {
    throw new Error("Approver tidak dapat membuat surat peringatan.");
  }

  const data = SPCreateInputSchema.parse(input);

  return prisma.suratPeringatan.create({
    data: { ...data, petugasId: session.user.id },
  });
}
