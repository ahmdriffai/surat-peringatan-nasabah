import { JenisSP } from "@/generated/prisma/enums";
import z from "zod/v3";

export const SetJenisSPApproverInputSchema = z.object({
  jenis: z.nativeEnum(JenisSP),
  approverIds: z.array(z.string()).min(1, "Pilih minimal 1 approver"),
});

export type SetJenisSPApproverInput = z.infer<
  typeof SetJenisSPApproverInputSchema
>;
