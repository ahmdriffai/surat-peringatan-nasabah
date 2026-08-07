"use server";

import { User } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export async function getOwnProfile(): Promise<User> {
  const session = await requireSession();

  return prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
  });
}
