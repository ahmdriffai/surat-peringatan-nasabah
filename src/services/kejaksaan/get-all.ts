"use server";

import { KepalaKejaksaan } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export async function getAllKepalaKejaksaan(): Promise<KepalaKejaksaan[]> {
  await requireSession();

  return prisma.kepalaKejaksaan.findMany({
    orderBy: { createdAt: "desc" },
  });
}
