import { authOptions } from "@/lib/auth";
import type { Role } from "@/generated/prisma/client";
import { getServerSession, type Session } from "next-auth";

export async function requireSession(): Promise<Session> {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("Anda harus login untuk melakukan aksi ini.");
  }

  return session;
}

export async function requireRole(role: Role): Promise<Session> {
  const session = await requireSession();

  if (session.user.role !== role) {
    throw new Error("Anda tidak memiliki akses untuk melakukan aksi ini.");
  }

  return session;
}
