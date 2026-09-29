import { z } from "zod";

const ExternalNasabahDataSchema = z.object({
  cif: z.string().min(1),
  nama: z.string().min(1),
  nik: z.string().min(1),
  nomorRekening: z.string().optional(),
  email: z.string().optional(),
  telepon: z.string().optional(),
  alamat: z.string().optional(),
});

const optionalNumber = z.preprocess(
  (value) =>
    value === "" || value === null || value === undefined
      ? undefined
      : Number(value),
  z.number().finite().nonnegative().optional(),
);

const optionalDate = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.date().optional(),
);

const JaminanBaseInputSchema = z.object({
  nasabahId: z.string().optional(),
  nasabahData: ExternalNasabahDataSchema.optional(),
  noPjm: z.string().min(1, "Nomor pinjaman wajib diisi"),
  jenis: z.string().min(1, "Jenis jaminan wajib diisi"),
  nomorDokumen: z.string().trim().optional(),
  deskripsi: z.string().trim().optional(),
  atasNama: z.string().trim().optional(),
  nilaiTaksiran: optionalNumber,
  lokasiPenyimpanan: z.string().trim().optional(),
  tanggalDiterima: optionalDate,
  catatan: z.string().trim().optional(),
});

export const JaminanCreateInputSchema = JaminanBaseInputSchema.refine(
  (data) => Boolean(data.nasabahId || data.nasabahData?.cif),
  {
  message: "Pilih data pinjaman dari Core Banking",
  path: ["nasabahId"],
  },
);

export const JaminanEditInputSchema = JaminanBaseInputSchema
  .omit({ nasabahData: true })
  .extend({ nasabahId: z.string().min(1, "Nasabah wajib dipilih") });

export const MutasiJaminanInputSchema = z.object({
  arah: z.enum(["MASUK", "KELUAR"]),
  terjadiPada: z.coerce.date(),
  diserahkanKepada: z.string().trim().optional(),
  diterimaDari: z.string().trim().optional(),
  keperluan: z.string().trim().optional(),
  lokasi: z.string().trim().optional(),
  tanggalKembaliRencana: optionalDate,
  tanggalKembali: optionalDate,
  catatan: z.string().trim().optional(),
});

export type JaminanCreateInput = z.infer<typeof JaminanCreateInputSchema>;
export type JaminanEditInput = z.infer<typeof JaminanEditInputSchema>;
export type MutasiJaminanInput = z.infer<typeof MutasiJaminanInputSchema>;
