"use server";

import {
  JaminanCreateInput,
  JaminanCreateInputSchema,
} from "@/features/jaminan/schema";
import { JaminanPinjaman } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { saveUploadedEvidence } from "@/lib/upload";

export async function createJaminan(
  input: JaminanCreateInput,
  bukti?: File,
): Promise<JaminanPinjaman> {
  const session = await requireSession();
  const { nasabahData, nasabahId: providedNasabahId, ...data } =
    JaminanCreateInputSchema.parse(input);
  const buktiUrl = bukti?.size
    ? await saveUploadedEvidence(bukti, "bukti-jaminan")
    : undefined;

  return prisma.$transaction(async (tx) => {
    let nasabahId = providedNasabahId;

    if (nasabahData) {
      const existing = await tx.nasabah.findFirst({
        where: {
          OR: [
            { cif: nasabahData.cif },
            ...(nasabahData.nik ? [{ nik: nasabahData.nik }] : []),
          ],
        },
      });

      if (existing) {
        nasabahId = existing.id;
      } else {
        const nasabah = await tx.nasabah.create({
          data: {
            cif: nasabahData.cif,
            nama: nasabahData.nama,
            nik: nasabahData.nik,
            nomorRekening: nasabahData.nomorRekening || data.noPjm || nasabahData.cif,
            email: nasabahData.email || null,
            telepon: nasabahData.telepon || null,
            alamat: nasabahData.alamat || null,
          },
        });
        nasabahId = nasabah.id;
      }
    }

    if (!nasabahId) {
      throw new Error("Nasabah belum dipilih atau tidak valid.");
    }

    const jaminan = await tx.jaminanPinjaman.create({
      data: {
        ...data,
        nasabahId,
        nomorDokumen: data.nomorDokumen || null,
        deskripsi: data.deskripsi || null,
        atasNama: data.atasNama || null,
        lokasiPenyimpanan: data.lokasiPenyimpanan || null,
        catatan: data.catatan || null,
      },
    });

    await tx.mutasiJaminan.create({
      data: {
        jaminanId: jaminan.id,
        arah: "MASUK",
        terjadiPada: data.tanggalDiterima ?? new Date(),
        diterimaDari: data.atasNama || null,
        lokasi: data.lokasiPenyimpanan || null,
        catatan: "Penerimaan awal jaminan",
        bukti: buktiUrl,
        dicatatOlehId: session.user.id,
      },
    });

    return jaminan;
  });
}
