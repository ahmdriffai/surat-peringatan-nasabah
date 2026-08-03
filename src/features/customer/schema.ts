import z from "zod/v3";

export const NasabahCreateInputSchema = z.object({
  cif: z.string().min(1, "CIF wajib diisi"),
  nama: z.string().min(1, "Nama wajib diisi"),
  nik: z.string().min(1, "NIK wajib diisi"),
  nomorRekening: z.string().min(1, "Nomor rekening wajib diisi"),
  email: z.string().email("Email tidak valid").optional(),
  telepon: z.string().optional(),
  alamat: z.string().optional(),
});

export type NasabahCreateInput = z.infer<typeof NasabahCreateInputSchema>;

export const NasabahEditInputSchema = NasabahCreateInputSchema.partial();

export type NasabahEditInput = z.infer<typeof NasabahEditInputSchema>;
