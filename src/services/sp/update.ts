"use server";

import { SPCreateInput, SPCreateInputSchema } from "@/features/sp/schema";
import { SuratPeringatan } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export async function updateSP(
  id: string,
  input: SPCreateInput,
): Promise<SuratPeringatan> {
  const session = await requireSession();

  const existing = await prisma.suratPeringatan.findUniqueOrThrow({
    where: { id },
  });

  const isOwner = existing.petugasId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isOwner && !isAdmin) {
    throw new Error("Anda tidak memiliki akses untuk mengubah surat ini.");
  }

  if (existing.status !== "DRAFT" && existing.status !== "DITOLAK") {
    throw new Error(
      "Surat hanya dapat diubah saat berstatus Draft atau Ditolak.",
    );
  }

  const { nasabahData, ...data } = SPCreateInputSchema.parse(input);

  return prisma.suratPeringatan.update({
    where: { id },
    data,
  });
}
