"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/generated/prisma/client";

interface LoginUser {
  id: string;
  nama: string;
  email: string;
  role: Role;
}

export async function checkLogin(
  email: string,
  password: string,
): Promise<LoginUser> {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new Error("Email atau password salah");
  }

  if (!user.aktif) {
    throw new Error("Akun Anda tidak aktif");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Email atau password salah");
  }

  return {
    id: user.id,
    nama: user.nama,
    email: user.email,
    role: user.role,
  };
}
