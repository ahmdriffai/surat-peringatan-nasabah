"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatDateTime } from "@/features/sp/label";
import { useGetDetailJaminan } from "@/features/jaminan/hook";
import { StatusJaminan } from "@/generated/prisma/enums";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

const STATUS_LABEL: Record<StatusJaminan, string> = {
  TERSIMPAN: "Tersimpan",
  DIBAWA_KELUAR: "Dibawa keluar",
  SELESAI_PENGIKATAN: "Selesai pengikatan",
  LUNAS: "Lunas",
};

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 border-b py-3 last:border-b-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value || "-"}</dd>
    </div>
  );
}

export default function JaminanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: jaminan, isLoading } = useGetDetailJaminan(id);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Memuat detail jaminan...</p>;
  }

  if (!jaminan) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Jaminan tidak ditemukan.</p>
        <Button variant="outline" asChild>
          <Link href="/jaminan-pinjaman">Kembali</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/jaminan-pinjaman">
          <ChevronLeft className="size-4" />
          Kembali ke Jaminan Pinjaman
        </Link>
      </Button>

      <div>
        <h2 className="text-xl font-semibold">Detail Jaminan Pinjaman</h2>
        <p className="mt-1 text-muted-foreground">
          {jaminan.jenis} · {jaminan.nasabah.nama}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Data Jaminan</CardTitle></CardHeader>
          <CardContent>
            <dl>
              <DetailRow label="Jenis Jaminan" value={jaminan.jenis} />
              <DetailRow label="Nomor Dokumen" value={jaminan.nomorDokumen} />
              <DetailRow label="Atas Nama" value={jaminan.atasNama} />
              <DetailRow label="Notaris" value={jaminan.notaris} />
              <DetailRow label="Lokasi Penyimpanan" value={jaminan.lokasiPenyimpanan} />
              <DetailRow
                label="Status"
                value={<Badge>{STATUS_LABEL[jaminan.status]}</Badge>}
              />
              <DetailRow
                label="Tanggal Diterima"
                value={jaminan.tanggalDiterima ? formatDate(jaminan.tanggalDiterima) : "-"}
              />
              <DetailRow label="Deskripsi" value={jaminan.deskripsi} />
              <DetailRow label="Catatan" value={jaminan.catatan} />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Nasabah & Pinjaman</CardTitle></CardHeader>
          <CardContent>
            <dl>
              <DetailRow label="Nama Nasabah" value={jaminan.nasabah.nama} />
              <DetailRow label="CIF" value={jaminan.nasabah.cif} />
              <DetailRow label="NIK" value={jaminan.nasabah.nik} />
              <DetailRow label="Nomor Pinjaman" value={jaminan.pinjaman?.noPjm ?? jaminan.noPjm} />
              <DetailRow label="Jenis Fasilitas" value={jaminan.pinjaman?.jenisFasilitas} />
              <DetailRow label="Alamat" value={jaminan.nasabah.alamat} />
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Riwayat Mutasi</CardTitle></CardHeader>
        <CardContent>
          {jaminan.mutasi.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada riwayat mutasi.</p>
          ) : (
            <div className="space-y-4">
              {jaminan.mutasi.map((mutasi) => (
                <div key={mutasi.id} className="rounded-xl border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge variant={mutasi.arah === "MASUK" ? "default" : "secondary"}>
                      {mutasi.arah === "MASUK" ? "Masuk" : "Keluar"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatDateTime(mutasi.terjadiPada)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm">Dicatat oleh: {mutasi.dicatatOleh.nama}</p>
                  <p className="text-sm text-muted-foreground">
                    {mutasi.keperluan || "Tidak ada keperluan"}
                  </p>
                  <p className="mt-2 text-sm">
                    Approval: {mutasi.approval?.status === "DISETUJUI" ? "Disetujui" : "Menunggu persetujuan"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
