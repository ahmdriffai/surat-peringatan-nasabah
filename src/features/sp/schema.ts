import { Prisma } from "@/generated/prisma/client";
import { JenisSP, MetodePengiriman } from "@/generated/prisma/enums";
import z from "zod/v3";

export type SPWithNasabah = Prisma.SuratPeringatanGetPayload<{
  include: {
    nasabah: true;
    kejaksaan: true;
    petugas: true;
    approvals: { include: { approver: true }; orderBy: { urutan: "asc" } };
  };
}>;

export const ExternalNasabahDataSchema = z.object({
  cif: z.string().min(1, "CIF wajib diisi"),
  nama: z.string().min(1, "Nama nasabah wajib diisi"),
  nik: z.string().min(1, "NIK nasabah wajib diisi"),
  nomorRekening: z.string().optional(),
  email: z.string().optional(),
  telepon: z.string().optional(),
  alamat: z.string().optional(),
});

export type ExternalNasabahData = z.infer<typeof ExternalNasabahDataSchema>;

export const SPCreateInputSchema = z
  .object({
    nasabahId: z.string().optional(),
    nasabahData: ExternalNasabahDataSchema.optional(),
    jenis: z.nativeEnum(JenisSP),

    noPjm: z.string().min(1, "Nomor pinjaman wajib diisi"),
    jenisFasilitas: z.string().min(1, "Jenis fasilitas wajib diisi"),
    tanggalAkadKredit: z.coerce.date().optional(),
    sukuBunga: z.number().min(0, "Suku bunga tidak valid").optional(),
    plafond: z.number(),
    saldo: z.number(),
    tgkPokok: z.number(),
    tgkBunga: z.number(),
    tgkPokokHari: z.number().int(),
    tgkBungaHari: z.number().int(),
    biayaAdministrasi: z.number().min(0).optional(),
    denda: z.number().min(0).optional(),

    kolektibilitas: z.number().int().min(1).max(5, "Kolektibilitas 1-5"),
    alasan: z.string().min(10, "Alasan minimal 10 karakter"),
    tanggalSurat: z.coerce.date(),
    tanggalJatuhTempo: z.coerce.date(),
    catatan: z.string().optional(),

    // Data Khusus Somasi
    batasWaktuHari: z.number().int().min(1).optional(),

    // Data Khusus Agunan & Lelang
    jenisAgunan: z.string().optional(),
    dokumenAgunan: z.string().optional(),
    atasNamaAgunan: z.string().optional(),
    lokasiAgunan: z.string().optional(),
    nilaiLimitLelang: z.number().min(0).optional(),
    kpknl: z.string().optional(),
    tanggalLelang: z.coerce.date().optional(),
  })
  .refine((data) => Boolean(data.nasabahId || data.nasabahData?.cif), {
    message: "Nasabah wajib dipilih atau dicari dari sistem Core Banking",
    path: ["nasabahId"],
  });

export type SPCreateInput = z.infer<typeof SPCreateInputSchema>;

export const ApproveSPInputSchema = z.object({
  catatan: z.string().optional(),
});

export type ApproveSPInput = z.infer<typeof ApproveSPInputSchema>;

export const RejectSPInputSchema = z.object({
  catatan: z.string().min(1, "Alasan penolakan wajib diisi"),
});

export type RejectSPInput = z.infer<typeof RejectSPInputSchema>;

export const TandaiTerkirimInputSchema = z.object({
  metodePengiriman: z.nativeEnum(MetodePengiriman),
  tanggalKirim: z.coerce.date(),
  noResi: z.string().optional(),
});

export type TandaiTerkirimInput = z.infer<typeof TandaiTerkirimInputSchema>;
