"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { StatusSP } from "@/generated/prisma/enums";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Eye,
  FileText,
  History,
  Image as ImageIcon,
  Landmark,
  Truck,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useGetAllSP } from "../hook";
import {
  APPROVAL_STATUS_LABEL,
  APPROVAL_STATUS_VARIANT,
  formatCurrency,
  formatDate,
  JENIS_LABEL,
  METODE_PENGIRIMAN_LABEL,
  STATUS_LABEL,
  STATUS_VARIANT,
} from "../label";
import { SPWithNasabah } from "../schema";

const WORKFLOW_STEPS: { status: StatusSP; label: string }[] = [
  { status: "DRAFT", label: "Draft" },
  { status: "MENUNGGU_APPROVAL", label: "Diajukan" },
  { status: "DISETUJUI", label: "Disetujui" },
  { status: "TERKIRIM", label: "Terkirim" },
  { status: "SELESAI", label: "Selesai" },
];

function ProgressStepper({ status }: { status: StatusSP }) {
  const isRejected = status === "DITOLAK";
  const currentIndex = isRejected
    ? 1
    : WORKFLOW_STEPS.findIndex((s) => s.status === status);

  return (
    <Card>
      <CardContent className="py-6">
        <div className="flex items-start">
          {WORKFLOW_STEPS.map((step, index) => {
            const isDone = index < currentIndex;
            const isCurrent = index === currentIndex && !isRejected;
            const isRejectedHere = index === currentIndex && isRejected;
            const leftLineActive = index > 0 && index <= currentIndex;
            const rightLineActive = index < currentIndex;

            return (
              <div
                key={step.status}
                className="flex flex-1 flex-col items-center gap-2 last:max-w-fit last:flex-none"
              >
                <div className="flex w-full items-center">
                  <div
                    className={cn(
                      "h-px flex-1",
                      index === 0 && "invisible",
                      leftLineActive ? "bg-primary" : "bg-border",
                    )}
                  />
                  <div
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium",
                      isDone && "border-primary bg-primary text-primary-foreground",
                      isCurrent &&
                        "border-primary bg-primary text-primary-foreground",
                      isRejectedHere &&
                        "border-destructive bg-destructive text-destructive-foreground",
                      !isDone &&
                        !isCurrent &&
                        !isRejectedHere &&
                        "border-border text-muted-foreground",
                    )}
                  >
                    {isDone ? (
                      <Check className="size-4" />
                    ) : isRejectedHere ? (
                      <X className="size-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div
                    className={cn(
                      "h-px flex-1",
                      index === WORKFLOW_STEPS.length - 1 && "invisible",
                      rightLineActive ? "bg-primary" : "bg-border",
                    )}
                  />
                </div>
                <span
                  className={cn(
                    "text-center text-xs",
                    isDone || isCurrent || isRejectedHere
                      ? "font-medium text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
                {isRejectedHere && index === currentIndex && (
                  <span className="text-center text-xs font-medium text-destructive">
                    Ditolak
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

interface Props {
  sp: SPWithNasabah;
}

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("text-right font-medium", mono && "font-mono")}>
        {value}
      </span>
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2">
        <Icon className="size-4 text-muted-foreground" />
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-border/50 text-sm">
        {children}
      </CardContent>
    </Card>
  );
}

export default function SPDetail({ sp }: Props) {
  const { data: allSP } = useGetAllSP();

  const rejectedApproval = sp.approvals.find((a) => a.status === "DITOLAK");
  const showApproval = sp.approvals.length > 0;

  const showPengiriman =
    (sp.status === "TERKIRIM" || sp.status === "SELESAI") && sp.tanggalKirim;

  const showBukti = sp.buktiKirim || sp.buktiTandaTerima;

  const riwayatLain = (allSP ?? [])
    .filter((s) => s.nasabahId === sp.nasabahId && s.id !== sp.id)
    .sort(
      (a, b) =>
        new Date(b.tanggalSurat).getTime() - new Date(a.tanggalSurat).getTime(),
    );

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-xl">Surat Peringatan</CardTitle>
              <Badge>{JENIS_LABEL[sp.jenis] ?? sp.jenis}</Badge>
            </div>
            <CardDescription className="font-mono">
              {sp.nomorSurat ?? "Belum diterbitkan"}
            </CardDescription>
          </div>
          <Badge variant={STATUS_VARIANT[sp.status]} className="h-6 px-3">
            {STATUS_LABEL[sp.status]}
          </Badge>
        </CardHeader>
      </Card>

      {/* Progress / Alur Surat */}
      <ProgressStepper status={sp.status} />

      {/* Catatan penolakan */}
      {sp.status === "DITOLAK" && rejectedApproval?.catatan && (
        <Alert variant="destructive">
          <AlertTriangle />
          <AlertTitle>Alasan Penolakan</AlertTitle>
          <AlertDescription>{rejectedApproval.catatan}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          <SectionCard icon={FileText} title="Detail Surat">
            <InfoRow label="Nasabah" value={sp.nasabah.nama} />
            <InfoRow
              label="No. Rekening"
              value={sp.nasabah.nomorRekening}
              mono
            />
            <InfoRow
              label="Jenis SP"
              value={<Badge>{JENIS_LABEL[sp.jenis] ?? sp.jenis}</Badge>}
            />
            <InfoRow label="Tanggal Surat" value={formatDate(sp.tanggalSurat)} />
            <InfoRow
              label="Jatuh Tempo"
              value={formatDate(sp.tanggalJatuhTempo)}
            />

            <div className="space-y-1.5 py-2.5">
              <span className="text-muted-foreground">Alasan</span>
              <p className="leading-relaxed">{sp.alasan}</p>
            </div>
            {sp.catatan && (
              <div className="space-y-1.5 py-2.5 last:pb-0">
                <span className="text-muted-foreground">Catatan</span>
                <p className="leading-relaxed">{sp.catatan}</p>
              </div>
            )}
          </SectionCard>

          <SectionCard icon={Landmark} title="Data Pinjaman">
            <InfoRow label="No. Pinjaman" value={sp.noPjm} mono />
            <InfoRow label="Kolektibilitas" value={sp.kolektibilitas} />
            <InfoRow label="Plafond" value={formatCurrency(sp.plafond)} />
            <InfoRow label="Saldo" value={formatCurrency(sp.saldo)} />
            <InfoRow
              label="Tunggakan Pokok"
              value={`${formatCurrency(sp.tgkPokok)} (${sp.tgkPokokHari} hari)`}
            />
            <InfoRow
              label="Tunggakan Bunga"
              value={`${formatCurrency(sp.tgkBunga)} (${sp.tgkBungaHari} hari)`}
            />
          </SectionCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {showApproval && (
            <SectionCard icon={CheckCircle2} title="Approval">
              {sp.approvals.map((approval, index) => (
                <div key={approval.id} className="space-y-1.5 py-2.5 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">
                      Approver {index + 1}: {approval.approver.nama}
                    </span>
                    <Badge variant={APPROVAL_STATUS_VARIANT[approval.status]}>
                      {APPROVAL_STATUS_LABEL[approval.status]}
                    </Badge>
                  </div>
                  {approval.approvedAt && (
                    <p className="text-sm text-muted-foreground">
                      {formatDate(approval.approvedAt)}
                    </p>
                  )}
                  {approval.catatan && (
                    <p className="text-sm leading-relaxed">
                      {approval.catatan}
                    </p>
                  )}
                </div>
              ))}
            </SectionCard>
          )}

          {showPengiriman && (
            <SectionCard icon={Truck} title="Pengiriman">
              <InfoRow
                label="Metode"
                value={
                  sp.metodePengiriman
                    ? METODE_PENGIRIMAN_LABEL[sp.metodePengiriman]
                    : "-"
                }
              />
              <InfoRow
                label="Tanggal Kirim"
                value={sp.tanggalKirim ? formatDate(sp.tanggalKirim) : "-"}
              />
              {sp.noResi && (
                <InfoRow label="No. Resi" value={sp.noResi} mono />
              )}
            </SectionCard>
          )}

          {riwayatLain.length > 0 && (
            <SectionCard icon={History} title="Riwayat Surat Peringatan Lain">
              {riwayatLain.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-2 py-2.5 first:pt-0 last:pb-0"
                >
                  <div className="space-y-0.5">
                    <p className="font-mono text-xs">
                      {s.nomorSurat ?? "Belum diterbitkan"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {JENIS_LABEL[s.jenis] ?? s.jenis} &middot;{" "}
                      {formatDate(s.tanggalSurat)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant={STATUS_VARIANT[s.status]}>
                      {STATUS_LABEL[s.status]}
                    </Badge>
                    <Button variant="ghost" size="icon-sm" asChild>
                      <Link href={`/surat-peringatan/${s.id}`}>
                        <Eye className="size-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </SectionCard>
          )}
        </div>
      </div>

      {/* Bukti Pengiriman */}
      {showBukti && (
        <SectionCard icon={ImageIcon} title="Bukti Pengiriman">
          <div className="grid gap-4 py-2.5 first:pt-0 md:grid-cols-2">
            {sp.buktiKirim && (
              <div className="space-y-1.5">
                <span className="text-muted-foreground">Bukti Kirim</span>
                <a
                  href={sp.buktiKirim}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    src={sp.buktiKirim}
                    alt="Bukti Kirim"
                    width={600}
                    height={400}
                    className="mt-1 max-h-64 w-full rounded-xl border object-contain"
                  />
                </a>
              </div>
            )}
            {sp.buktiTandaTerima && (
              <div className="space-y-1.5">
                <span className="text-muted-foreground">
                  Bukti Tanda Terima
                </span>
                <a
                  href={sp.buktiTandaTerima}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    src={sp.buktiTandaTerima}
                    alt="Bukti Tanda Terima"
                    width={600}
                    height={400}
                    className="mt-1 max-h-64 w-full rounded-xl border object-contain"
                  />
                </a>
              </div>
            )}
          </div>
        </SectionCard>
      )}
    </div>
  );
}
