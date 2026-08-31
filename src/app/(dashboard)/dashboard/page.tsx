"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Table from "@/components/ui/table-custom";
import { useGetAllNasabah } from "@/features/customer/hook";
import { useGetAllSP } from "@/features/sp/hook";
import {
  formatDate,
  JENIS_LABEL,
  STATUS_BADGE_CLASS,
  STATUS_BAR_CLASS,
  STATUS_LABEL,
} from "@/features/sp/label";
import { SPWithNasabah } from "@/features/sp/schema";
import { countMyPendingApprovals } from "@/features/sp/utils";
import { JenisSP, StatusSP } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ClipboardCheck,
  Eye,
  NotepadText,
  Users2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useMemo } from "react";

const STATUS_ORDER = Object.values(StatusSP);
const JENIS_ORDER = Object.values(JenisSP);
const DUE_SOON_DAYS = 7;

export default function DashboardPage() {
  const { data: session } = useSession();
  const role = session?.user.role;
  const userId = session?.user.id;
  const isPetugas = role === "PETUGAS";
  const isApprover = role === "APPROVER";

  const { data: allSP, isLoading: isLoadingSP } = useGetAllSP();
  const { data: nasabah, isLoading: isLoadingNasabah } = useGetAllNasabah();
  const isLoading = isLoadingSP || isLoadingNasabah;

  const sp = useMemo(() => {
    if (!allSP) return [];
    return isPetugas ? allSP.filter((s) => s.petugasId === userId) : allSP;
  }, [allSP, isPetugas, userId]);

  const statusCounts = useMemo(() => {
    const counts = new Map<StatusSP, number>(
      STATUS_ORDER.map((status) => [status, 0]),
    );
    for (const s of sp) counts.set(s.status, (counts.get(s.status) ?? 0) + 1);
    return counts;
  }, [sp]);

  const jenisCounts = useMemo(() => {
    const counts = new Map<JenisSP, number>(
      JENIS_ORDER.map((jenis) => [jenis, 0]),
    );
    for (const s of sp) counts.set(s.jenis, (counts.get(s.jenis) ?? 0) + 1);
    return counts;
  }, [sp]);

  const menungguApproval = statusCounts.get("MENUNGGU_APPROVAL") ?? 0;
  const menungguGiliranSaya = countMyPendingApprovals(allSP ?? [], userId);

  const dueSoon = useMemo(() => {
    const now = new Date();
    const limit = new Date(now.getTime() + DUE_SOON_DAYS * 24 * 60 * 60 * 1000);
    return sp
      .filter(
        (s) => s.status === "TERKIRIM" && new Date(s.tanggalJatuhTempo) <= limit,
      )
      .sort(
        (a, b) =>
          new Date(a.tanggalJatuhTempo).getTime() -
          new Date(b.tanggalJatuhTempo).getTime(),
      );
  }, [sp]);

  const recentSP = useMemo(
    () =>
      [...sp]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 8),
    [sp],
  );

  const maxStatusCount = Math.max(1, ...statusCounts.values());
  const maxJenisCount = Math.max(1, ...jenisCounts.values());

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-xl font-semibold">
          Selamat datang kembali, {session?.user.nama ?? "..."}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Ringkasan surat peringatan{" "}
          {isPetugas ? "yang Anda kelola" : "seluruh nasabah"} hari ini.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users2} label="Total Nasabah" value={nasabah?.length ?? 0} />
        <StatCard
          icon={NotepadText}
          label={isPetugas ? "Surat Saya" : "Total Surat Peringatan"}
          value={sp.length}
        />
        <StatCard
          icon={ClipboardCheck}
          label={isApprover ? "Menunggu Giliran Anda" : "Menunggu Approval"}
          value={isApprover ? menungguGiliranSaya : menungguApproval}
          href="/persetujuan"
          tone="bg-amber-500/10 text-amber-600"
        />
        <StatCard
          icon={AlertTriangle}
          label="Segera Jatuh Tempo"
          value={dueSoon.length}
          description={`Terkirim, jatuh tempo ${DUE_SOON_DAYS} hari ke depan`}
          tone="bg-red-500/10 text-red-600"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Status Surat Peringatan</CardTitle>
            <CardDescription>Distribusi status surat</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading && (
              <p className="text-sm text-muted-foreground">Memuat...</p>
            )}
            {!isLoading && sp.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Belum ada data surat peringatan.
              </p>
            )}
            {!isLoading &&
              sp.length > 0 &&
              STATUS_ORDER.map((status) => {
                const count = statusCounts.get(status) ?? 0;
                const width = (count / maxStatusCount) * 100;
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {STATUS_LABEL[status]}
                      </span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn("h-full rounded-full", STATUS_BAR_CLASS[status])}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Jenis Surat</CardTitle>
            <CardDescription>Distribusi berdasarkan jenis surat</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading && (
              <p className="text-sm text-muted-foreground">Memuat...</p>
            )}
            {!isLoading && sp.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Belum ada data surat peringatan.
              </p>
            )}
            {!isLoading &&
              sp.length > 0 &&
              JENIS_ORDER.map((jenis) => {
                const count = jenisCounts.get(jenis) ?? 0;
                const width = (count / maxJenisCount) * 100;
                return (
                  <div key={jenis} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {JENIS_LABEL[jenis] ?? jenis}
                      </span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary/70"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </CardContent>
        </Card>
      </div>

      {dueSoon.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Segera Jatuh Tempo</CardTitle>
            <CardDescription>
              Surat berstatus Terkirim dengan jatuh tempo dalam{" "}
              {DUE_SOON_DAYS} hari ke depan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {dueSoon.map((s) => (
              <Link
                key={s.id}
                href={`/surat-peringatan/${s.id}`}
                className="flex items-center justify-between gap-4 rounded-xl border p-3 text-sm transition-colors hover:bg-muted/50"
              >
                <div className="space-y-0.5">
                  <p className="font-medium">{s.nasabah.nama}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.nomorSurat ?? "Belum diterbitkan"} &middot;{" "}
                    {JENIS_LABEL[s.jenis] ?? s.jenis}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="bg-red-500/15 text-red-700 dark:text-red-400"
                >
                  Jatuh tempo {formatDate(s.tanggalJatuhTempo)}
                </Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Surat Peringatan Terbaru</CardTitle>
          <CardDescription>8 surat terakhir yang dibuat</CardDescription>
        </CardHeader>
        <CardContent>
          <Table<SPWithNasabah>
            data={recentSP}
            keyExtractor={(row) => row.id}
            emptyMessage="Belum ada data surat peringatan"
            columns={[
              {
                header: "Nomor Surat",
                accessor: (row) => row.nomorSurat ?? "-",
              },
              {
                header: "Nasabah",
                accessor: (row) => (
                  <div className="flex flex-col">
                    <span>{row.nasabah.nama}</span>
                    <span className="text-xs text-muted-foreground">
                      {row.nasabah.nomorRekening}
                    </span>
                  </div>
                ),
              },
              {
                header: "Jenis",
                accessor: (row) => JENIS_LABEL[row.jenis] ?? row.jenis,
              },
              {
                header: "Status",
                accessor: (row) => (
                  <Badge variant="outline" className={STATUS_BADGE_CLASS[row.status]}>
                    {STATUS_LABEL[row.status]}
                  </Badge>
                ),
              },
              {
                header: "Tanggal Surat",
                accessor: (row) => formatDate(row.tanggalSurat),
              },
              {
                header: "Action",
                accessor: (row) => (
                  <Link
                    href={`/surat-peringatan/${row.id}`}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Eye className="size-4" />
                  </Link>
                ),
              },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  description,
  href,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  description?: string;
  href?: string;
  tone?: string;
}) {
  const content = (
    <Card className={cn(href && "transition-colors hover:bg-muted/40")}>
      <CardContent className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary",
            tone,
          )}
        >
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );

  return href ? (
    <Link href={href} className="block">
      {content}
    </Link>
  ) : (
    content
  );
}
