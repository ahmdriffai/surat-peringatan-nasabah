"use server";

import {
  JaminanCreateInput,
  JaminanCreateInputSchema,
} from "@/features/jaminan/schema";
import { JaminanPinjaman } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireJaminanAccess } from "@/lib/session";
import { saveUploadedEvidence } from "@/lib/upload";

export async function createJaminan(
  input: JaminanCreateInput,
  bukti?: File,
): Promise<JaminanPinjaman> {
  const session = await requireJaminanAccess();
  const {
    nasabahData,
    nasabahId: providedNasabahId,
    diserahkanKepada,
    diterimaDari,
    keperluan,
    ...data
  } =
    JaminanCreateInputSchema.parse(input);
  const buktiUrl = bukti?.size
    ? await saveUploadedEvidence(bukti, "bukti-jaminan")
    : undefined;

  return prisma.$transaction(async (tx) => {
    const approver = await tx.user.findFirst({ where: { approverJaminan: true, aktif: true } });
    if (!approver) throw new Error("Belum ada approver jaminan yang ditunjuk.");
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

    const pinjaman = await tx.pinjaman.upsert({
      where: { nasabahId_noPjm: { nasabahId, noPjm: data.noPjm } },
      create: { nasabahId, noPjm: data.noPjm },
      update: {},
    });

    const jaminan = await tx.jaminanPinjaman.create({
      data: {
        ...data,
        nasabahId,
        pinjamanId: pinjaman.id,
        nomorDokumen: data.nomorDokumen || null,
        deskripsi: data.deskripsi || null,
        atasNama: data.atasNama || null,
        lokasiPenyimpanan: data.lokasiPenyimpanan || null,
        catatan: data.catatan || null,
      },
    });

    const mutasi = await tx.mutasiJaminan.create({
      data: {
        jaminanId: jaminan.id,
        arah: "MASUK",
        terjadiPada: data.tanggalDiterima ?? new Date(),
        diserahkanKepada: diserahkanKepada || null,
        diterimaDari: diterimaDari || null,
        keperluan: keperluan || null,
        lokasi: data.lokasiPenyimpanan || null,
        catatan: "Penerimaan awal jaminan",
        bukti: buktiUrl,
        dicatatOlehId: session.user.id,
      },
    });
    await tx.jaminanApproval.create({ data: { mutasiId: mutasi.id, approverId: approver.id } });

    return jaminan;
  });
}
