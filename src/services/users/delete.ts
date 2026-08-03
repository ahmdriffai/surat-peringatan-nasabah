"use server";

import { User } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export async function deleteUser(id: string): Promise<User> {
  await requireRole("ADMIN");

  return prisma.user.delete({
    where: { id },
  });
}
