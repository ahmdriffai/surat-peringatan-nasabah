"use server";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export type JenisSPApproverWithUser = Prisma.JenisSPApproverGetPayload<{
  include: { approver: true };
}>;

export async function getAllJenisSPApprovers(): Promise<
  JenisSPApproverWithUser[]
> {
  await requireSession();

  return prisma.jenisSPApprover.findMany({
    include: { approver: true },
    orderBy: [{ jenis: "asc" }, { urutan: "asc" }],
  });
}
