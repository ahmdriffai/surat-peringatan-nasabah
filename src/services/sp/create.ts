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

  const { nasabahData, nasabahId: providedNasabahId, ...data } =
    SPCreateInputSchema.parse(input);

  let finalNasabahId = providedNasabahId;

  // Jika ada data nasabah eksternal dari API Core Banking
  if (nasabahData) {
    // 1. Cek apakah CIF atau NIK sudah ada di database lokal
    const existing = await prisma.nasabah.findFirst({
      where: {
        OR: [
          { cif: nasabahData.cif },
          ...(nasabahData.nik ? [{ nik: nasabahData.nik }] : []),
        ],
      },
    });

    if (existing) {
      // Gunakan nasabah yang sudah ada
      finalNasabahId = existing.id;
    } else {
      // 2. Tambahkan nasabah baru ke database
      const newNasabah = await prisma.nasabah.create({
        data: {
          cif: nasabahData.cif,
          nama: nasabahData.nama,
          nik: nasabahData.nik,
          nomorRekening:
            nasabahData.nomorRekening || data.noPjm || nasabahData.cif,
          email: nasabahData.email || null,
          telepon: nasabahData.telepon || null,
          alamat: nasabahData.alamat || null,
        },
      });
      finalNasabahId = newNasabah.id;
    }
  }

  if (!finalNasabahId) {
    throw new Error("Nasabah belum dipilih atau tidak valid.");
  }

  return prisma.suratPeringatan.create({
    data: {
      ...data,
      nasabahId: finalNasabahId,
      petugasId: session.user.id,
    },
  });
}
