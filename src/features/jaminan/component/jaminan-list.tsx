"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Table from "@/components/ui/table-custom";
import { formatDate, formatDateTime } from "@/features/sp/label";
import { StatusJaminan } from "@/generated/prisma/enums";
import { JaminanWithDetails } from "@/services/jaminan/get-all";
import { NasabahWithPinjaman } from "@/services/nasabah/get-all";
import { Check, Eye, History, Loader2, Pen, Plus, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import {
  useApproveMutasiJaminan,
  useCreateMutasiJaminan,
  useDeleteJaminan,
  useDeleteMutasiJaminan,
  useEditJaminan,
} from "../hook";
import { JaminanCreateInput, JaminanEditInput } from "../schema";
import JaminanForm from "./jaminan-form";
import MutasiForm from "./mutasi-form";

interface Props {
  data: JaminanWithDetails[];
  nasabah: NasabahWithPinjaman[];
}

function dateInput(value: Date | null | undefined) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}

const STATUS_LABEL: Record<StatusJaminan, string> = {
  TERSIMPAN: "Tersimpan",
  DIBAWA_KELUAR: "Dibawa keluar",
  SELESAI_PENGIKATAN: "Selesai pengikatan",
  LUNAS: "Lunas",
};

export default function JaminanList({ data, nasabah }: Props) {
  const [editTarget, setEditTarget] = useState<JaminanWithDetails | null>(null);
  const [historyTarget, setHistoryTarget] = useState<JaminanWithDetails | null>(
    null,
  );
  const [mutasiTarget, setMutasiTarget] = useState<JaminanWithDetails | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [jenisFilter, setJenisFilter] = useState("ALL");
  const [lokasiFilter, setLokasiFilter] = useState("ALL");

  const edit = useEditJaminan();
  const remove = useDeleteJaminan();
  const createMutasi = useCreateMutasiJaminan();
  const removeMutasi = useDeleteMutasiJaminan();
  const approveMutasi = useApproveMutasiJaminan();
  const { data: session } = useSession();

  const filterOptions = useMemo(() => {
    const jenis = [
      ...new Set(
        data
          .map((row) => row.jenis)
          .filter((value): value is string => Boolean(value)),
      ),
    ].sort((a, b) => a.localeCompare(b, "id"));
    const lokasi = [
      ...new Set(
        data
          .map((row) => row.lokasiPenyimpanan)
          .filter((value): value is string => Boolean(value)),
      ),
    ].sort((a, b) => a.localeCompare(b, "id"));
    return { jenis, lokasi };
  }, [data]);

  const filteredData = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("id-ID");

    return data.filter((row) => {
      const searchableText = [
        row.nasabah.nama,
        row.nasabah.cif,
        row.pinjaman?.noPjm,
        row.noPjm,
        row.jenis,
        row.nomorDokumen,
        row.atasNama,
        row.lokasiPenyimpanan,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("id-ID");

      return (
        (!query || searchableText.includes(query)) &&
        (statusFilter === "ALL" || row.status === statusFilter) &&
        (jenisFilter === "ALL" || row.jenis === jenisFilter) &&
        (lokasiFilter === "ALL" || row.lokasiPenyimpanan === lokasiFilter)
      );
    });
  }, [data, jenisFilter, lokasiFilter, search, statusFilter]);

  const hasActiveFilter =
    Boolean(search) ||
    statusFilter !== "ALL" ||
    jenisFilter !== "ALL" ||
    lokasiFilter !== "ALL";

  const submitEdit = async (input: JaminanCreateInput) => {
    if (!editTarget) return;
    await edit.mutateAsync({
      id: editTarget.id,
      data: input as JaminanEditInput,
    });
    setEditTarget(null);
  };

  const submitMutasi = (
    input: Parameters<typeof createMutasi.mutate>[0]["data"],
    bukti?: File,
  ) => {
    if (!mutasiTarget) return;
    createMutasi.mutate(
      { jaminanId: mutasiTarget.id, data: input, bukti },
      { onSuccess: () => setMutasiTarget(null) },
    );
  };

  return (
    <>
      <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-medium">Filter jaminan</p>
            <p className="text-sm text-muted-foreground">
              Menampilkan {filteredData.length} dari {data.length} jaminan
            </p>
          </div>
          {hasActiveFilter && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
                setJenisFilter("ALL");
                setLokasiFilter("ALL");
              }}
            >
              Reset filter
            </Button>
          )}
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari nasabah, CIF, no. pinjaman..."
            aria-label="Cari jaminan"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Semua status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua status</SelectItem>
              {Object.values(StatusJaminan).map((status) => (
                <SelectItem key={status} value={status}>
                  {STATUS_LABEL[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={jenisFilter} onValueChange={setJenisFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Semua jenis jaminan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua jenis jaminan</SelectItem>
              {filterOptions.jenis.map((jenis) => (
                <SelectItem key={jenis} value={jenis}>
                  {jenis}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={lokasiFilter} onValueChange={setLokasiFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Semua lokasi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua lokasi</SelectItem>
              {filterOptions.lokasi.map((lokasi) => (
                <SelectItem key={lokasi} value={lokasi}>
                  {lokasi}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Table<JaminanWithDetails>
        data={filteredData}
        keyExtractor={(row) => row.id}
        emptyMessage={
          data.length === 0
            ? "Belum ada data jaminan pinjaman"
            : "Tidak ada jaminan yang sesuai filter"
        }
        columns={[
          {
            header: "Nasabah",
            accessor: (row) => (
              <div>
                <p className="font-medium">{row.nasabah.nama}</p>
                <p className="text-xs text-muted-foreground">
                  {row.nasabah.cif}
                </p>
              </div>
            ),
          },
          {
            header: "No. Pinjaman",
            accessor: (row) => row.pinjaman?.noPjm ?? row.noPjm,
          },
          {
            header: "Jaminan",
            accessor: (row) => (
              <div>
                <p>{row.jenis}</p>
                <p className="text-xs text-muted-foreground">
                  {row.nomorDokumen || "-"}
                </p>
              </div>
            ),
          },
          {
            header: "Status",
            accessor: (row) => (
              <Badge
                variant={row.status === "TERSIMPAN" ? "default" : "secondary"}
                className={
                  row.status === "SELESAI_PENGIKATAN"
                    ? "border-green-200 bg-green-100 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
                    : row.status === "LUNAS"
                      ? "border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
                      : undefined
                }
              >
                {STATUS_LABEL[row.status]}
              </Badge>
            ),
          },
          {
            header: "Aksi",
            accessor: (row) => (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  title="Catat mutasi"
                  onClick={() => setMutasiTarget(row)}
                >
                  <Plus />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  title="Riwayat"
                  onClick={() => setHistoryTarget(row)}
                >
                  <History />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  title="Edit"
                  onClick={() => setEditTarget(row)}
                >
                  <Pen />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  title="Hapus"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Hapus jaminan ini beserta seluruh riwayatnya?",
                      )
                    )
                      remove.mutate(row.id);
                  }}
                >
                  <Trash2 />
                </Button>
              </div>
            ),
          },
        ]}
      />

      <Dialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
      >
        <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Jaminan</DialogTitle>
            <DialogDescription>
              Perbarui data jaminan pinjaman.
            </DialogDescription>
          </DialogHeader>
          {editTarget && (
            <JaminanForm
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
                status: editTarget.status,
                tanggalDiterima: dateInput(editTarget.tanggalDiterima),
                catatan: editTarget.catatan ?? "",
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!mutasiTarget}
        onOpenChange={(open) => !open && setMutasiTarget(null)}
      >
        <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Catat Mutasi Jaminan</DialogTitle>
            <DialogDescription>
              {mutasiTarget?.jenis} —{" "}
              {mutasiTarget?.pinjaman?.noPjm ?? mutasiTarget?.noPjm}
            </DialogDescription>
          </DialogHeader>
          <MutasiForm
            onSubmit={submitMutasi}
            isPending={createMutasi.isPending}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!historyTarget}
        onOpenChange={(open) => !open && setHistoryTarget(null)}
      >
        <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Riwayat Keluar-Masuk Jaminan</DialogTitle>
            <DialogDescription>
              {historyTarget?.jenis} — {historyTarget?.nasabah.nama}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {historyTarget?.mutasi.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b pb-3 text-sm"
              >
                <div>
                  <Badge
                    variant={item.arah === "MASUK" ? "default" : "secondary"}
                  >
                    {item.arah === "MASUK" ? "Masuk" : "Keluar"}
                  </Badge>
                  <p className="mt-1">
                    {formatDateTime(item.terjadiPada)} · {item.dicatatOleh.nama}
                  </p>
                  <div className="mt-1 space-y-1">
                    <Badge
                      variant={
                        item.approval?.status === "DISETUJUI"
                          ? "default"
                          : "destructive"
                      }
                      className={
                        item.approval?.status === "DISETUJUI"
                          ? "text-green-600 dark:text-green-400"
                          : undefined
                      }
                    >
                      {item.approval?.status === "DISETUJUI"
                        ? "Sudah di-approve"
                        : "Belum di-approve"}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {item.approval?.status === "DISETUJUI"
                        ? `Oleh ${item.approval.approver.nama}${item.approval.approvedAt ? ` · ${formatDateTime(item.approval.approvedAt)}` : ""}`
                        : item.approval
                          ? `Menunggu ${item.approval.approver.nama}`
                          : "Belum ada data approval"}
                    </p>
                  </div>
                  <dl className="mt-2 grid gap-x-6 gap-y-1 text-muted-foreground sm:grid-cols-2">
                    <div>
                      <dt className="inline font-medium">Diserahkan oleh: </dt>
                      <dd className="inline">{item.diserahkanKepada || "-"}</dd>
                    </div>
                    <div>
                      <dt className="inline font-medium">Diterima oleh: </dt>
                      <dd className="inline">{item.diterimaDari || "-"}</dd>
                    </div>
                    <div>
                      <dt className="inline font-medium">Keperluan: </dt>
                      <dd className="inline">{item.keperluan || "-"}</dd>
                    </div>
                    <div>
                      <dt className="inline font-medium">Lokasi: </dt>
                      <dd className="inline">{item.lokasi || "-"}</dd>
                    </div>
                    <div>
                      <dt className="inline font-medium">Rencana kembali: </dt>
                      <dd className="inline">
                        {item.tanggalKembaliRencana
                          ? formatDate(item.tanggalKembaliRencana)
                          : "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="inline font-medium">
                        Realisasi kembali:{" "}
                      </dt>
                      <dd className="inline">
                        {item.tanggalKembali
                          ? formatDate(item.tanggalKembali)
                          : "-"}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="inline font-medium">Catatan: </dt>
                      <dd className="inline">{item.catatan || "-"}</dd>
                    </div>
                  </dl>
                </div>
                <div className="flex items-center gap-2">
                  {item.approval?.status === "PENDING" &&
                    item.approval.approverId === session?.user?.id && (
                      <Button
                        size="sm"
                        disabled={approveMutasi.isPending}
                        onClick={() => approveMutasi.mutate({ id: item.id })}
                      >
                        {approveMutasi.isPending ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <Check />
                        )}{" "}
                        Setujui
                      </Button>
                    )}
                  {item.bukti && (
                    <Button asChild size="sm" variant="outline">
                      <a href={item.bukti} target="_blank" rel="noreferrer">
                        <Eye /> Bukti
                      </a>
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={removeMutasi.isPending}
                    onClick={() => {
                      if (window.confirm("Hapus riwayat mutasi ini?"))
                        removeMutasi.mutate(item.id);
                    }}
                  >
                    {removeMutasi.isPending ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Trash2 />
                    )}
                  </Button>
                </div>
              </div>
            ))}
            {!historyTarget?.mutasi.length && (
              <p className="text-sm text-muted-foreground">
                Belum ada riwayat mutasi.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
