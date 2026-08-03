import { ApprovalStatus, MetodePengiriman, StatusSP } from "@/generated/prisma/enums";

export const JENIS_LABEL: Record<string, string> = {
  PEMBERITAHUAN: "Surat Pemberitahuan",
  SP1: "Surat Peringatan I",
  SP2: "Surat Peringatan II",
  SP3: "Surat Peringatan III",
  PEMBERITAHUAN_SKK: "Surat Kuasa Khusus",
};

export const STATUS_LABEL: Record<StatusSP, string> = {
  DRAFT: "Draft",
  MENUNGGU_APPROVAL: "Menunggu Approval",
  DISETUJUI: "Disetujui",
  DITOLAK: "Ditolak",
  TERKIRIM: "Terkirim",
  SELESAI: "Selesai",
};

export const STATUS_VARIANT: Record<
  StatusSP,
  "default" | "secondary" | "destructive" | "outline"
> = {
  DRAFT: "secondary",
  MENUNGGU_APPROVAL: "outline",
  DISETUJUI: "default",
  DITOLAK: "destructive",
  TERKIRIM: "default",
  SELESAI: "secondary",
};

export const APPROVAL_STATUS_LABEL: Record<ApprovalStatus, string> = {
  PENDING: "Menunggu",
  DISETUJUI: "Disetujui",
  DITOLAK: "Ditolak",
};

export const APPROVAL_STATUS_VARIANT: Record<
  ApprovalStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDING: "outline",
  DISETUJUI: "default",
  DITOLAK: "destructive",
};

export const METODE_PENGIRIMAN_LABEL: Record<MetodePengiriman, string> = {
  POS: "Pos / Ekspedisi",
  EMAIL: "Email",
  LANGSUNG: "Langsung / Tatap Muka",
};

export const KOLEKTIBILITAS_LABEL: Record<number, string> = {
  1: "Lancar",
  2: "Dalam Perhatian Khusus",
  3: "Kurang Lancar",
  4: "Diragukan",
  5: "Macet",
};

export function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("id-ID", { dateStyle: "long" });
}

export function formatDateTime(date: Date): string {
  const formatted = new Date(date).toLocaleString("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  });
  return `${formatted} WIB`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function toDateInputValue(value?: Date): string {
  if (!value) return "";
  return value.toISOString().slice(0, 10);
}
