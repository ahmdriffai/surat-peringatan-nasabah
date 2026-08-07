import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatDate,
  formatDateTime,
  JENIS_LABEL,
  STATUS_BADGE_CLASS,
  STATUS_LABEL,
} from "@/features/sp/label";
import { cn } from "@/lib/utils";
import { getVerifikasiSP } from "@/services/sp/get-verifikasi";
import { CheckCircle2 } from "lucide-react";
import { notFound } from "next/navigation";

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
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("text-right", mono && "font-mono text-xs")}>
        {value}
      </span>
    </div>
  );
}

export default async function VerifikasiPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sp = await getVerifikasiSP(id);

  if (!sp) notFound();

  const disetujuiApprovals = sp.approvals.filter(
    (a) => a.status === "DISETUJUI",
  );
  const diterbitkan = disetujuiApprovals.at(-1)?.approvedAt ?? sp.tanggalSurat;

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-lg flex-col justify-center gap-6 p-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <Badge className="gap-1 bg-green-600 text-white hover:bg-green-600 dark:bg-green-500">
          <CheckCircle2 className="size-3.5" />
          Dokumen Valid
        </Badge>
        <h1 className="text-xl font-semibold tracking-tight">
          Verifikasi Surat Peringatan
        </h1>
        <p className="text-sm text-muted-foreground">
          Dokumen ini telah diterbitkan oleh{" "}
          <span className="font-medium text-foreground">
            PT. BPR BANK WONOSOBO (PERSERODA)
          </span>{" "}
          dan telah memperoleh persetujuan elektronik sesuai prosedur internal
          perusahaan.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informasi Surat</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <InfoRow
            label="Status"
            value={
              <span className="inline-flex items-center gap-1 font-medium text-green-600 dark:text-green-500">
                <CheckCircle2 className="size-3.5" />
                Valid
              </span>
            }
          />
          <InfoRow
            label="Nomor Surat"
            value={sp.nomorSurat ?? "Belum diterbitkan"}
            mono
          />
          <InfoRow label="Jenis Surat" value={JENIS_LABEL[sp.jenis] ?? sp.jenis} />
          <InfoRow label="Nama Debitur" value={sp.nasabah.nama} />
          <InfoRow label="Nomor Pinjaman" value={sp.noPjm} mono />
          <InfoRow label="Tanggal Surat" value={formatDate(sp.tanggalSurat)} />
          <InfoRow
            label="Status Dokumen"
            value={
              <Badge variant="outline" className={STATUS_BADGE_CLASS[sp.status]}>
                {STATUS_LABEL[sp.status]}
              </Badge>
            }
          />
        </CardContent>
      </Card>

      {disetujuiApprovals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Riwayat Persetujuan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {disetujuiApprovals.map((approval, index) => (
              <div key={index} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600 dark:text-green-500" />
                <div>
                  <p className="font-medium">
                    {approval.approver.jabatan ?? "Approver"}
                  </p>
                  <p>{approval.approver.nama}</p>
                  {approval.approvedAt && (
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(approval.approvedAt)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informasi Verifikasi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <InfoRow label="ID Dokumen" value={sp.id} mono />
          <InfoRow label="Diterbitkan" value={formatDate(diterbitkan)} />
          <InfoRow
            label="Terakhir Diverifikasi"
            value={formatDateTime(sp.lastVerifiedAt)}
          />
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        Dokumen ini diterbitkan melalui Sistem Manajemen Surat PT. BPR BANK
        WONOSOBO (PERSERODA). Apabila terdapat perbedaan isi antara dokumen
        yang diterima dengan data pada halaman ini, maka dokumen dinyatakan
        tidak valid.
      </p>
    </div>
  );
}
