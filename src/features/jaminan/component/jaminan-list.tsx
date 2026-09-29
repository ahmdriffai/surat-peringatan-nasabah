"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Table from "@/components/ui/table-custom";
import { Nasabah } from "@/generated/prisma/client";
import { formatDateTime } from "@/features/sp/label";
import { Eye, History, Loader2, Pen, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  useCreateMutasiJaminan,
  useDeleteJaminan,
  useDeleteMutasiJaminan,
  useEditJaminan,
} from "../hook";
import { JaminanCreateInput, JaminanEditInput } from "../schema";
import { JaminanWithDetails } from "@/services/jaminan/get-all";
import JaminanForm from "./jaminan-form";
import MutasiForm from "./mutasi-form";

interface Props {
  data: JaminanWithDetails[];
  nasabah: Nasabah[];
}

function dateInput(value: Date | null | undefined) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}

export default function JaminanList({ data, nasabah }: Props) {
  const [editTarget, setEditTarget] = useState<JaminanWithDetails | null>(null);
  const [historyTarget, setHistoryTarget] = useState<JaminanWithDetails | null>(null);
  const [mutasiTarget, setMutasiTarget] = useState<JaminanWithDetails | null>(null);

  const edit = useEditJaminan();
  const remove = useDeleteJaminan();
  const createMutasi = useCreateMutasiJaminan();
  const removeMutasi = useDeleteMutasiJaminan();

  const submitEdit = (input: JaminanCreateInput) => {
    if (!editTarget) return;
    edit.mutate(
      { id: editTarget.id, data: input as JaminanEditInput },
      { onSuccess: () => setEditTarget(null) },
    );
  };

  const submitMutasi = (input: Parameters<typeof createMutasi.mutate>[0]["data"], bukti?: File) => {
    if (!mutasiTarget) return;
    createMutasi.mutate(
      { jaminanId: mutasiTarget.id, data: input, bukti },
      { onSuccess: () => setMutasiTarget(null) },
    );
  };

  return (
    <>
      <Table<JaminanWithDetails>
        data={data}
        keyExtractor={(row) => row.id}
        emptyMessage="Belum ada data jaminan pinjaman"
        columns={[
          { header: "Nasabah", accessor: (row) => <div><p className="font-medium">{row.nasabah.nama}</p><p className="text-xs text-muted-foreground">{row.nasabah.cif}</p></div> },
          { header: "No. Pinjaman", accessor: "noPjm" },
          { header: "Jaminan", accessor: (row) => <div><p>{row.jenis}</p><p className="text-xs text-muted-foreground">{row.nomorDokumen || "-"}</p></div> },
          { header: "Status", accessor: (row) => <Badge variant={row.status === "TERSIMPAN" ? "default" : "secondary"}>{row.status === "TERSIMPAN" ? "Tersimpan" : "Dibawa keluar"}</Badge> },
          { header: "Aksi", accessor: (row) => <div className="flex gap-2">
            <Button size="sm" variant="secondary" title="Catat mutasi" onClick={() => setMutasiTarget(row)}><Plus /></Button>
            <Button size="sm" variant="secondary" title="Riwayat" onClick={() => setHistoryTarget(row)}><History /></Button>
            <Button size="sm" variant="secondary" title="Edit" onClick={() => setEditTarget(row)}><Pen /></Button>
            <Button size="sm" variant="destructive" title="Hapus" onClick={() => { if (window.confirm("Hapus jaminan ini beserta seluruh riwayatnya?")) remove.mutate(row.id); }}><Trash2 /></Button>
          </div> },
        ]}
      />

      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>Edit Jaminan</DialogTitle><DialogDescription>Perbarui data jaminan pinjaman.</DialogDescription></DialogHeader>
          {editTarget && <JaminanForm
            nasabah={nasabah}
            isPending={edit.isPending}
            onSubmit={submitEdit}
            submitLabel="Simpan Perubahan"
            defaultValues={{
              nasabahId: editTarget.nasabahId,
              noPjm: editTarget.noPjm,
              jenis: editTarget.jenis,
              nomorDokumen: editTarget.nomorDokumen ?? "",
              deskripsi: editTarget.deskripsi ?? "",
              atasNama: editTarget.atasNama ?? "",
              nilaiTaksiran: editTarget.nilaiTaksiran?.toString() ?? "",
              lokasiPenyimpanan: editTarget.lokasiPenyimpanan ?? "",
              tanggalDiterima: dateInput(editTarget.tanggalDiterima),
              catatan: editTarget.catatan ?? "",
            }}
          />}
        </DialogContent>
      </Dialog>

      <Dialog open={!!mutasiTarget} onOpenChange={(open) => !open && setMutasiTarget(null)}>
        <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>Catat Mutasi Jaminan</DialogTitle><DialogDescription>{mutasiTarget?.jenis} — {mutasiTarget?.noPjm}</DialogDescription></DialogHeader>
          <MutasiForm onSubmit={submitMutasi} isPending={createMutasi.isPending} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!historyTarget} onOpenChange={(open) => !open && setHistoryTarget(null)}>
        <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-4xl">
          <DialogHeader><DialogTitle>Riwayat Keluar-Masuk Jaminan</DialogTitle><DialogDescription>{historyTarget?.jenis} — {historyTarget?.nasabah.nama}</DialogDescription></DialogHeader>
          <div className="space-y-3">
            {historyTarget?.mutasi.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 border-b pb-3 text-sm">
                <div>
                  <Badge variant={item.arah === "MASUK" ? "default" : "secondary"}>{item.arah === "MASUK" ? "Masuk" : "Keluar"}</Badge>
                  <p className="mt-1">{formatDateTime(item.terjadiPada)} · {item.dicatatOleh.nama}</p>
                  <p className="text-muted-foreground">{item.keperluan || item.catatan || "-"}</p>
                </div>
                <div className="flex items-center gap-2">
                  {item.bukti && <Button asChild size="sm" variant="outline"><a href={item.bukti} target="_blank" rel="noreferrer"><Eye /> Bukti</a></Button>}
                  <Button size="sm" variant="destructive" disabled={removeMutasi.isPending} onClick={() => { if (window.confirm("Hapus riwayat mutasi ini?")) removeMutasi.mutate(item.id); }}>
                    {removeMutasi.isPending ? <Loader2 className="animate-spin" /> : <Trash2 />}
                  </Button>
                </div>
              </div>
            ))}
            {!historyTarget?.mutasi.length && <p className="text-sm text-muted-foreground">Belum ada riwayat mutasi.</p>}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
