import "dotenv/config"
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client"
import bcrypt from "bcryptjs"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 12)

  await prisma.user.upsert({
    where: { email: "admin@bank.co.id" },
    update: { jabatan: "Admin Sistem" },
    create: {
      nama: "Admin Sistem",
      jabatan: "Admin Sistem",
      email: "admin@bank.co.id",
      password: hashedPassword,
      role: "ADMIN",
    },
  })

  await prisma.user.upsert({
    where: { email: "petugas@bank.co.id" },
    update: { jabatan: "Petugas SP" },
    create: {
      nama: "Petugas SP",
      jabatan: "Petugas SP",
      email: "petugas@bank.co.id",
      password: hashedPassword,
      role: "PETUGAS",
    },
  })

  await prisma.user.upsert({
    where: { email: "approver1@bank.co.id" },
    update: { jabatan: "Direktur Utama" },
    create: {
      nama: "Galih Pambajeng, S.Ak",
      jabatan: "Direktur Utama",
      email: "approver1@bank.co.id",
      password: hashedPassword,
      role: "APPROVER",
    },
  })

  await prisma.user.upsert({
    where: { email: "approver2@bank.co.id" },
    update: { jabatan: "Kepala Kredit" },
    create: {
      nama: "Budi Santoso",
      jabatan: "Kepala Kredit",
      email: "approver2@bank.co.id",
      password: hashedPassword,
      role: "APPROVER",
    },
  })

  console.log("Seed selesai.")
  console.log("  ADMIN     : admin@bank.co.id     / password123")
  console.log("  PETUGAS   : petugas@bank.co.id   / password123")
  console.log("  APPROVER 1: approver1@bank.co.id / password123 (Direktur Utama)")
  console.log("  APPROVER 2: approver2@bank.co.id / password123 (Kepala Kredit)")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
