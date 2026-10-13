"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export async function approveMutasiJaminan(id: string, catatan?: string) {
  const session = await requireSession();
  return prisma.$transaction(async (tx) => {
    const approval = await tx.jaminanApproval.findUnique({ where: { mutasiId: id } });
    if (!approval || approval.status !== "PENDING") throw new Error("Mutasi ini sudah diproses.");
    if (approval.approverId !== session.user.id) throw new Error("Hanya petugas jaminan yang ditunjuk dapat menyetujui mutasi ini.");
    const mutasi = await tx.mutasiJaminan.findUniqueOrThrow({ where: { id } });
    await tx.jaminanApproval.update({ where: { mutasiId: id }, data: { status: "DISETUJUI", catatan: catatan || null, approvedAt: new Date() } });
    await tx.jaminanPinjaman.update({ where: { id: mutasi.jaminanId }, data: { status: mutasi.arah === "KELUAR" ? "DIBAWA_KELUAR" : "TERSIMPAN" } });
    return mutasi;
  });
}
