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
  const pinjaman = await prisma.pinjaman.upsert({
    where: { nasabahId_noPjm: { nasabahId: data.nasabahId!, noPjm: data.noPjm } },
    create: {
      nasabahId: data.nasabahId!,
      noPjm: data.noPjm,
      jenisFasilitas: data.jenisFasilitas,
      tanggalAkadKredit: data.tanggalAkadKredit,
      sukuBunga: data.sukuBunga,
      plafond: data.plafond,
      saldo: data.saldo,
      tgkPokok: data.tgkPokok,
      tgkBunga: data.tgkBunga,
      tgkPokokHari: data.tgkPokokHari,
      tgkBungaHari: data.tgkBungaHari,
    },
    update: {},
  });

  return prisma.suratPeringatan.update({
    where: { id },
    data: { ...data, pinjamanId: pinjaman.id },
  });
}
