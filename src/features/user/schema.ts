import { Role } from "@/generated/prisma/enums";
import z from "zod/v3";

export const EditUserInputSchema = z.object({
  nama: z.string().optional(),
  jabatan: z.string().optional(),
  email: z.string().email("email tidak valid").optional(),
  role: z.nativeEnum(Role).optional(),
  aktif: z.boolean().optional(),
});

export type EditUserInput = z.infer<typeof EditUserInputSchema>;
