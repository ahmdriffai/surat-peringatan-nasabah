"use server";

import { EditUserInput, EditUserInputSchema } from "@/features/user/schema";
import { User } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export async function editUser(
  id: string,
  input: EditUserInput,
): Promise<User> {
  await requireRole("ADMIN");
  const data = EditUserInputSchema.parse(input);

  return prisma.user.update({
    where: { id },
    data: data,
  });
}
