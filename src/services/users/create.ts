"use server";

import bcrypt from "bcryptjs";
import {
  CreateUserInput,
  CreateUserInputSchema,
} from "@/features/user/schema";
import { User } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export async function createUser(input: CreateUserInput): Promise<User> {
  await requireRole("ADMIN");
  const data = CreateUserInputSchema.parse(input);

  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existing) {
    throw new Error("Email sudah digunakan user lain.");
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);

  return prisma.user.create({
    data: { ...data, password: hashedPassword },
  });
}
