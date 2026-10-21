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

export async function requireJaminanAccess(): Promise<Session> {
  const session = await requireSession();

  if (!session.user.petugasJaminan) {
    throw new Error("Anda tidak memiliki akses ke menu jaminan.");
  }

  return session;
}

export async function requireJaminanApproval(): Promise<Session> {
  const session = await requireSession();

  if (!session.user.approverJaminan) {
    throw new Error("Anda tidak memiliki izin approval jaminan.");
  }

  return session;
}

export async function requireJaminanView(): Promise<Session> {
  const session = await requireSession();

  if (!session.user.petugasJaminan && !session.user.approverJaminan) {
    throw new Error("Anda tidak memiliki akses ke data jaminan.");
  }

  return session;
}
