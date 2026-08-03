"use server";

import { prisma } from "@/lib/prisma";
import { User } from "@/generated/prisma/client";

export async function getAllUsers(): Promise<User[]> {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });
}
