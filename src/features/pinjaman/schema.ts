import z from "zod/v3";

export const PinjamanCreateInputSchema = z.object({
  noPjm: z.string().min(1, "Nomor pinjaman wajib diisi"),
  jenisFasilitas: z.string().optional(),
  tanggalAkadKredit: z.coerce.date().optional(),
  sukuBunga: z.number().min(0).optional(),
  plafond: z.number().min(0).optional(),
  saldo: z.number().min(0).optional(),
  tgkPokok: z.number().min(0).optional(),
  tgkBunga: z.number().min(0).optional(),
  tgkPokokHari: z.number().int().min(0).optional(),
  tgkBungaHari: z.number().int().min(0).optional(),
});

export type PinjamanCreateInput = z.infer<typeof PinjamanCreateInputSchema>;
