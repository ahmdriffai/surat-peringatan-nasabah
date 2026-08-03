"use server";

import {
  NasabahCreateInput,
  NasabahCreateInputSchema,
} from "@/features/customer/schema";
import { Nasabah } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export async function createNasabah(
  input: NasabahCreateInput,
): Promise<Nasabah> {
  const data = NasabahCreateInputSchema.parse(input);

  return prisma.nasabah.create({
    data,
  });
}
