import z from "zod/v3";

export const KepalaKejaksaanInputSchema = z.object({
  nama: z.string().min(1, "Nama wajib diisi"),
  jabatan: z.string().min(1, "Jabatan wajib diisi"),
  pangkat: z.string().optional(),
  nip: z.string().optional(),
  alamat: z.string().optional(),
});

export type KepalaKejaksaanInput = z.infer<typeof KepalaKejaksaanInputSchema>;
