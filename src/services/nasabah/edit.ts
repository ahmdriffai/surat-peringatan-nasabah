"use server";

import {
  NasabahEditInput,
  NasabahEditInputSchema,
} from "@/features/customer/schema";
import { Nasabah } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export async function editNasabah(
  id: string,
  input: NasabahEditInput,
): Promise<Nasabah> {
  const data = NasabahEditInputSchema.parse(input);

  return prisma.nasabah.update({
    where: { id },
    data,
  });
}
