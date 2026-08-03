"use server";

import { prisma } from "@/lib/prisma";

export async function getVerifikasiSP(id: string) {
  const sp = await prisma.suratPeringatan.findUnique({
    where: { id },
    select: {
      id: true,
      nomorSurat: true,
      jenis: true,
      status: true,
      tanggalSurat: true,
      noPjm: true,
      nasabah: { select: { nama: true } },
      approvals: {
        select: {
          status: true,
          approvedAt: true,
          approver: { select: { nama: true, jabatan: true } },
        },
        orderBy: { urutan: "asc" },
      },
    },
  });

  if (!sp) return null;

  const verifiedAt = new Date();
  await prisma.suratPeringatan.update({
    where: { id },
    data: { lastVerifiedAt: verifiedAt },
  });

  return { ...sp, lastVerifiedAt: verifiedAt };
}

export type VerifikasiSP = NonNullable<
  Awaited<ReturnType<typeof getVerifikasiSP>>
>;
