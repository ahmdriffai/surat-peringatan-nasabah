"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export interface ExternalLoanData {
  KodeCabang: string;
  NoPjm: string;
  NasabahID: string; // CIF
  Nama: string;
  NIK: string;
  TmpLahir?: string;
  TglLahir?: string;
  Alamat?: string;
  Phone?: string;
  Email?: string;
  JnsPjm?: string;
  Unit?: string;
  Col?: string; // Kolektibilitas "1" - "5"
  Plafond?: number;
  Saldo?: number;
  TgkPokok?: number;
  TgkBunga?: number;
  TgkTotal?: number;
  TgkPokokFrek?: number;
  TgkBungaFrek?: number;
  TgkPokokHari?: number;
  TgkBungaHAri?: number;
  TgkBungaHari?: number;
  StsPjm?: string;
}

export interface ExternalLoanResponse {
  RC: string;
  data: ExternalLoanData[];
}

export interface SearchLoanParams {
  kodecabang?: string;
  cif?: string;
  nama?: string;
  nik?: string;
  nopjm?: string;
}

export interface EnrichedLoanData extends ExternalLoanData {
  isRegisteredInDb: boolean;
  existingNasabahId?: string;
}

const EXTERNAL_API_HOST =
  process.env.CORE_BANKING_API_HOST || "https://ptkbm.com:8443";
const EXTERNAL_API_PATH = "/bwakses/apirem";

export async function searchExternalLoans(
  params: SearchLoanParams,
): Promise<EnrichedLoanData[]> {
  await requireSession();

  const kodecabang = params.kodecabang || "01";
  const cif = params.cif?.trim() || "";
  const nama = params.nama?.trim() || "";
  const nik = params.nik?.trim() || "";
  const nopjm = params.nopjm?.trim() || "";

  // Setidaknya salah satu kriteria pencarian harus diisi
  if (!cif && !nama && !nik && !nopjm) {
    return [];
  }

  const payload = {
    kodecabang,
    cif,
    nama,
    nik,
    nopjm,
  };

  try {
    const url = `${EXTERNAL_API_HOST}${EXTERNAL_API_PATH}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        `Gagal menghubungi API Core Banking (Status: ${response.status})`,
      );
    }

    const result: ExternalLoanResponse = await response.json();

    if (result.RC !== "00" || !Array.isArray(result.data)) {
      return [];
    }

    // Ambil list CIF untuk memeriksa apakah sudah terdaftar di database lokal
    const cifList = result.data
      .map((item) => item.NasabahID)
      .filter((cif): cif is string => Boolean(cif));

    const existingNasabahList = await prisma.nasabah.findMany({
      where: {
        cif: { in: cifList },
      },
      select: { id: true, cif: true },
    });

    const existingMap = new Map(
      existingNasabahList.map((n) => [n.cif, n.id]),
    );

    return result.data.map((item) => {
      const existingId = existingMap.get(item.NasabahID);
      return {
        ...item,
        isRegisteredInDb: Boolean(existingId),
        existingNasabahId: existingId,
      };
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan pada server";
    console.error("Error fetching external loan data:", error);
    throw new Error(message);
  }
}
