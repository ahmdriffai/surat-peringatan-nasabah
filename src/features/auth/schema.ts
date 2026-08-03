import z from "zod/v3";

export const LoginInputSchema = z.object({
  email: z.string().min(1, "email wajib diisi"),
  password: z.string().min(2, "password wajib diisi"),
});

export type LoginInput = z.infer<typeof LoginInputSchema>;
