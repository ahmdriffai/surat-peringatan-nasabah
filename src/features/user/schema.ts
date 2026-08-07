import { Role } from "@/generated/prisma/enums";
import z from "zod/v3";

export const CreateUserInputSchema = z.object({
  nama: z.string().min(1, "Nama wajib diisi"),
  jabatan: z.string().optional(),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.nativeEnum(Role),
});

export type CreateUserInput = z.infer<typeof CreateUserInputSchema>;

export const EditUserInputSchema = z.object({
  nama: z.string().optional(),
  jabatan: z.string().optional(),
  email: z.string().email("email tidak valid").optional(),
  role: z.nativeEnum(Role).optional(),
  aktif: z.boolean().optional(),
});

export type EditUserInput = z.infer<typeof EditUserInputSchema>;

export const UpdateProfileInputSchema = z.object({
  nama: z.string().min(1, "Nama wajib diisi"),
  jabatan: z.string().optional(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileInputSchema>;

export const ChangePasswordInputSchema = z
  .object({
    passwordLama: z.string().min(1, "Password lama wajib diisi"),
    passwordBaru: z.string().min(6, "Password baru minimal 6 karakter"),
    konfirmasiPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.passwordBaru === data.konfirmasiPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["konfirmasiPassword"],
  });

export type ChangePasswordInput = z.infer<typeof ChangePasswordInputSchema>;
