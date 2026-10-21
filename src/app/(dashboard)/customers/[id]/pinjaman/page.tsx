"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetAllNasabah } from "@/features/customer/hook";
import { useGetAllJaminan } from "@/features/jaminan/hook";
import { JaminanWithDetails } from "@/services/jaminan/get-all";
import { useGetAllSP } from "@/features/sp/hook";
import { formatDate, JENIS_LABEL, STATUS_BADGE_CLASS, STATUS_LABEL } from "@/features/sp/label";
import { ArrowLeft, Eye, Info } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PinjamanForm from "@/features/pinjaman/component/pinjaman-form";
import { useCreatePinjaman } from "@/features/pinjaman/hook";
import { PinjamanCreateInput } from "@/features/pinjaman/schema";
import { useSession } from "next-auth/react";

function formatAmount(value: number | null | undefined) {
  return value == null
    ? "-"
    : new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
}

export default function PinjamanDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: session } = useSession();
  const { data: nasabahList = [], isLoading: loadingNasabah } = useGetAllNasabah();
  const { data: allSP = [], isLoading: loadingSP } = useGetAllSP();
  const hasJaminanAccess = session?.user.petugasJaminan === true;
  const { data: allJaminan = [], isLoading: loadingJaminan } = useGetAllJaminan(hasJaminanAccess);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailJaminan, setDetailJaminan] = useState<JaminanWithDetails | null>(null);
  const createPinjaman = useCreatePinjaman();
  const nasabah = nasabahList.find((item) => item.id === params.id);

  if (loadingNasabah || loadingSP || (hasJaminanAccess && loadingJaminan)) {
    return <p className="text-sm text-muted-foreground">Memuat detail pinjaman...</p>;
  }

  if (!nasabah) {
    return <p className="text-sm text-muted-foreground">Nasabah tidak ditemukan.</p>;
  }

  const handleCreatePinjaman = (data: PinjamanCreateInput) => {
    createPinjaman.mutate(
      { nasabahId: nasabah.id, data },
      { onSuccess: () => setCreateOpen(false) },
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2 -ml-3">
            <Link href="/customers"><ArrowLeft /> Kembali ke nasabah</Link>
          </Button>
          <h1 className="text-2xl font-semibold">Detail Pinjaman</h1>
          <p className="text-sm text-muted-foreground">{nasabah.nama} · CIF {nasabah.cif}</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}><span className="mr-2">+</span>Tambah pinjaman</Button>
      </div>

      {nasabah.pinjaman.length === 0 ? (
        <p className="rounded-xl border p-6 text-sm text-muted-foreground">Belum ada data pinjaman.</p>
      ) : (
        <div className="space-y-6">
          {nasabah.pinjaman.map((pinjaman) => {
            const riwayatSP = allSP
              .filter((sp) => sp.pinjamanId === pinjaman.id)
              .sort((a, b) => new Date(b.tanggalSurat).getTime() - new Date(a.tanggalSurat).getTime());
            const riwayatJaminan = allJaminan.filter((jaminan) => jaminan.pinjamanId === pinjaman.id);

            return (
              <section key={pinjaman.id} className="space-y-4 rounded-2xl border p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                  <div>
                    <h2 className="font-mono text-lg font-semibold">{pinjaman.noPjm}</h2>
                    <p className="text-sm text-muted-foreground">{pinjaman.jenisFasilitas || "Jenis fasilitas belum diisi"}</p>
                  </div>
                  <dl className="grid grid-cols-2 gap-x-5 gap-y-1 text-right text-sm">
                    <div><dt className="text-muted-foreground">Plafond</dt><dd>{formatAmount(pinjaman.plafond)}</dd></div>
                    <div><dt className="text-muted-foreground">Saldo</dt><dd>{formatAmount(pinjaman.saldo)}</dd></div>
                  </dl>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  <div className="space-y-3">
                    <h3 className="font-semibold">Riwayat Surat Peringatan</h3>
                    {riwayatSP.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Belum ada riwayat SP untuk pinjaman ini.</p>
                    ) : riwayatSP.map((sp) => (
                      <div key={sp.id} className="flex items-center justify-between gap-3 rounded-xl border p-3">
                        <div>
                          <p className="font-medium">{sp.nomorSurat ?? "Belum diterbitkan"}</p>
                          <p className="text-sm text-muted-foreground">{JENIS_LABEL[sp.jenis] ?? sp.jenis} · {formatDate(sp.tanggalSurat)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={STATUS_BADGE_CLASS[sp.status]}>{STATUS_LABEL[sp.status]}</Badge>
                          <Button variant="secondary" size="sm" asChild><Link href={`/surat-peringatan/${sp.id}`}><Eye /></Link></Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold">Riwayat Jaminan</h3>
                    {riwayatJaminan.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Belum ada jaminan untuk pinjaman ini.</p>
                    ) : riwayatJaminan.map((jaminan) => (
                      <div key={jaminan.id} className="rounded-xl border p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div><p className="font-medium">{jaminan.jenis}</p><p className="text-sm text-muted-foreground">{jaminan.nomorDokumen || "Nomor dokumen belum diisi"}</p></div>
                          <div className="flex items-center gap-2">
                            <Badge variant={jaminan.status === "TERSIMPAN" ? "default" : "secondary"} className={jaminan.status === "SELESAI_PENGIKATAN" ? "border-green-200 bg-green-100 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300" : undefined}>{jaminan.status === "TERSIMPAN" ? "Tersimpan" : jaminan.status === "DIBAWA_KELUAR" ? "Dibawa keluar" : "Selesai pengikatan"}</Badge>
                            <Button variant="secondary" size="sm" onClick={() => setDetailJaminan(jaminan)}><Info /></Button>
                          </div>
                        </div>
                        <div className="mt-3 space-y-2 border-t pt-2 text-sm">
                          {jaminan.mutasi.length === 0 ? <p className="text-muted-foreground">Belum ada riwayat mutasi.</p> : jaminan.mutasi.map((mutasi) => (
                            <div key={mutasi.id} className="flex justify-between gap-3"><span>{mutasi.arah === "MASUK" ? "Masuk" : "Keluar"} · {formatDate(mutasi.terjadiPada)}</span><span className="text-muted-foreground">{mutasi.keperluan || "-"}</span></div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}

      <Dialog open={!!detailJaminan} onOpenChange={(open) => !open && setDetailJaminan(null)}>
        <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Jaminan</DialogTitle>
            <DialogDescription>{detailJaminan?.jenis} · {detailJaminan?.nomorDokumen || "Nomor dokumen belum diisi"}</DialogDescription>
          </DialogHeader>
          {detailJaminan && (
            <div className="space-y-5 text-sm">
              <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                <div><dt className="text-muted-foreground">Atas nama</dt><dd>{detailJaminan.atasNama || "-"}</dd></div>
                <div><dt className="text-muted-foreground">Nilai taksiran</dt><dd>{formatAmount(detailJaminan.nilaiTaksiran)}</dd></div>
                <div><dt className="text-muted-foreground">Lokasi penyimpanan</dt><dd>{detailJaminan.lokasiPenyimpanan || "-"}</dd></div>
                <div><dt className="text-muted-foreground">Tanggal diterima</dt><dd>{detailJaminan.tanggalDiterima ? formatDate(detailJaminan.tanggalDiterima) : "-"}</dd></div>
                <div className="sm:col-span-2"><dt className="text-muted-foreground">Deskripsi</dt><dd>{detailJaminan.deskripsi || "-"}</dd></div>
                <div className="sm:col-span-2"><dt className="text-muted-foreground">Catatan</dt><dd>{detailJaminan.catatan || "-"}</dd></div>
              </dl>
              <div className="space-y-2 border-t pt-4">
                <h3 className="font-semibold">Riwayat Mutasi</h3>
                {detailJaminan.mutasi.length === 0 ? <p className="text-muted-foreground">Belum ada riwayat mutasi.</p> : detailJaminan.mutasi.map((mutasi) => (
                  <div key={mutasi.id} className="rounded-lg border p-3">
                    <div className="flex justify-between gap-3">
                      <span className="font-medium">{mutasi.arah === "MASUK" ? "Masuk" : "Keluar"}</span>
                      <span className="text-muted-foreground">{formatDate(mutasi.terjadiPada)}</span>
                    </div>
                    <p className="mt-1 text-muted-foreground">{mutasi.keperluan || "Tidak ada keperluan"}{mutasi.lokasi ? ` · ${mutasi.lokasi}` : ""}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tambah Pinjaman</DialogTitle>
            <DialogDescription>Tambahkan fasilitas pinjaman untuk {nasabah.nama}.</DialogDescription>
          </DialogHeader>
          <PinjamanForm onSubmit={handleCreatePinjaman} isPending={createPinjaman.isPending} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
