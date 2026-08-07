"use server";

import bcrypt from "bcryptjs";
import {
  ChangePasswordInput,
  ChangePasswordInputSchema,
} from "@/features/user/schema";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export async function changeOwnPassword(
  input: ChangePasswordInput,
): Promise<void> {
  const session = await requireSession();
  const { passwordLama, passwordBaru } =
    ChangePasswordInputSchema.parse(input);

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
  });

  const isValid = await bcrypt.compare(passwordLama, user.password);
  if (!isValid) {
    throw new Error("Password lama salah");
  }

  const hashed = await bcrypt.hash(passwordBaru, 12);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashed },
  });
}
