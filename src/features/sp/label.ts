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

export const STATUS_BADGE_CLASS: Record<StatusSP, string> = {
  DRAFT: "bg-slate-500/15 text-slate-700 dark:text-slate-300",
  MENUNGGU_APPROVAL: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  DISETUJUI: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  DITOLAK: "bg-red-500/15 text-red-700 dark:text-red-400",
  TERKIRIM: "bg-violet-500/15 text-violet-700 dark:text-violet-400",
  SELESAI: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
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
