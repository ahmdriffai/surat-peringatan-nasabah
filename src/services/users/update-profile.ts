"use server";

import {
  UpdateProfileInput,
  UpdateProfileInputSchema,
} from "@/features/user/schema";
import { User } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export async function updateOwnProfile(
  input: UpdateProfileInput,
): Promise<User> {
  const session = await requireSession();
  const data = UpdateProfileInputSchema.parse(input);

  return prisma.user.update({
    where: { id: session.user.id },
    data,
  });
}
