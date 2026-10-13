"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Table from "@/components/ui/table-custom";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { History, Landmark, Loader2, Pen, Plus, Search, Trash2, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { useDeleteNasabah, useEditNasabah } from "../hook";
import { NasabahCreateInput } from "../schema";
import CustomerForm from "./customer-form";
import RiwayatSPDialog from "./riwayat-sp-dialog";
import { NasabahWithPinjaman } from "@/services/nasabah/get-all";
import PinjamanForm from "@/features/pinjaman/component/pinjaman-form";
import { useCreatePinjaman } from "@/features/pinjaman/hook";
import { PinjamanCreateInput } from "@/features/pinjaman/schema";

interface Props {
  nasabah: NasabahWithPinjaman[];
}

export default function CustomerList({ nasabah }: Props) {
  const [search, setSearch] = useState("");
  const [editTarget, setEditTarget] = useState<NasabahWithPinjaman | null>(null);
  const [riwayatTarget, setRiwayatTarget] = useState<NasabahWithPinjaman | null>(null);
  const [pinjamanTarget, setPinjamanTarget] = useState<NasabahWithPinjaman | null>(null);
  const [createPinjamanTarget, setCreatePinjamanTarget] = useState<NasabahWithPinjaman | null>(null);

  const { mutate: mutateEdit, isPending: isEditPending } = useEditNasabah();
  const { mutate: mutateDelete, isPending: isDeletePending } =
    useDeleteNasabah();
  const createPinjaman = useCreatePinjaman();

  const handleEditSubmit = (data: NasabahCreateInput) => {
    if (!editTarget) return;

    mutateEdit(
      { id: editTarget.id, data },
      { onSuccess: () => setEditTarget(null) },
    );
  };

  const handleDelete = (id: string) => {
    mutateDelete(id);
  };

  const handleCreatePinjaman = (data: PinjamanCreateInput) => {
    if (!createPinjamanTarget) return;
    createPinjaman.mutate(
      { nasabahId: createPinjamanTarget.id, data },
      { onSuccess: () => setCreatePinjamanTarget(null) },
    );
  };

  const query = search.trim().toLowerCase();
  const filteredNasabah = query
    ? nasabah.filter((row) =>
        [row.cif, row.nama, row.nik, row.nomorRekening, row.email, row.telepon]
          .some((value) => value?.toLowerCase().includes(query)),
      )
    : nasabah;

  return (
    <>
      <div className="relative max-w-sm">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari nasabah..."
          aria-label="Cari nasabah"
          className="pl-9"
        />
      </div>
      <Table<NasabahWithPinjaman>
        data={filteredNasabah}
        keyExtractor={(row) => row.id}
        emptyMessage="Tidak ada data nasabah"
        columns={[
          {
            header: "No",
            accessor: () => <p>#</p>,
          },
          {
            header: "CIF",
            accessor: "cif",
          },
          {
            header: "Nama",
            accessor: "nama",
          },
          {
            header: "NIK",
            accessor: "nik",
          },
          {
            header: "No. Rekening",
            accessor: "nomorRekening",
          },
          // {
          //   header: "Email",
          //   accessor: (row) => row.email ?? "-",
          // },
          {
            header: "Telepon",
            accessor: (row) => row.telepon ?? "-",
          },
          {
            header: "Alamat",
            accessor: (row) => row.alamat ?? "-",
          },
          {
            header: "Action",
            accessor: (row) => (
              <div className="flex gap-2 justify-start">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setRiwayatTarget(row)}
                    >
                      <History />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Riwayat surat peringatan</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setCreatePinjamanTarget(row)}
                    >
                      <Plus />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Tambah pinjaman</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPinjamanTarget(row)}
                    >
                      <Landmark />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Detail pinjaman</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setEditTarget(row)}
                    >
                      <Pen />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit nasabah</p>
                  </TooltipContent>
                </Tooltip>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                      <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                        <Trash2Icon />
                      </AlertDialogMedia>
                      <AlertDialogTitle>Hapus nasabah?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tindakan ini akan menghapus data nasabah {row.nama}{" "}
                        secara permanen.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel variant="outline">
                        Batal
                      </AlertDialogCancel>
                      <AlertDialogAction
                        disabled={isDeletePending}
                        onClick={() => handleDelete(row.id)}
                        variant="destructive"
                      >
                        {isDeletePending && (
                          <Loader2 className="size-4 animate-spin" />
                        )}
                        {isDeletePending ? "Memproses..." : "Hapus"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
            <DialogTitle>Edit nasabah</DialogTitle>
            <DialogDescription>
              Perbarui data nasabah berikut lalu simpan perubahan.
            </DialogDescription>
          </DialogHeader>
          {editTarget && (
            <CustomerForm
              key={editTarget.id}
              defaultValues={{
                cif: editTarget.cif,
                nama: editTarget.nama,
                nik: editTarget.nik,
                nomorRekening: editTarget.nomorRekening,
                email: editTarget.email ?? "",
                telepon: editTarget.telepon ?? "",
                alamat: editTarget.alamat ?? "",
              }}
              submitLabel="Simpan perubahan"
              onSubmit={handleEditSubmit}
              isPending={isEditPending}
            />
          )}
        </DialogContent>
      </Dialog>

      <RiwayatSPDialog
        nasabah={riwayatTarget}
        onOpenChange={(open) => !open && setRiwayatTarget(null)}
      />

      <Dialog
        open={!!pinjamanTarget}
        onOpenChange={(open) => !open && setPinjamanTarget(null)}
      >
        <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detail Pinjaman</DialogTitle>
            <DialogDescription>
              Daftar fasilitas pinjaman milik {pinjamanTarget?.nama}.
            </DialogDescription>
          </DialogHeader>
          {!pinjamanTarget?.pinjaman.length ? (
            <p className="text-sm text-muted-foreground">Belum ada data pinjaman.</p>
          ) : (
            <div className="space-y-3">
              {pinjamanTarget.pinjaman.map((pinjaman) => (
                <div key={pinjaman.id} className="rounded-lg border p-4 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-mono font-semibold">{pinjaman.noPjm}</p>
                    <p className="text-muted-foreground">{pinjaman.jenisFasilitas || "Jenis fasilitas belum diisi"}</p>
                  </div>
                  <dl className="mt-3 grid gap-x-6 gap-y-2 text-muted-foreground sm:grid-cols-2">
                    <div><dt className="inline font-medium">Plafond: </dt><dd className="inline">{formatAmount(pinjaman.plafond)}</dd></div>
                    <div><dt className="inline font-medium">Saldo: </dt><dd className="inline">{formatAmount(pinjaman.saldo)}</dd></div>
                    <div><dt className="inline font-medium">Tunggakan pokok: </dt><dd className="inline">{formatAmount(pinjaman.tgkPokok)}</dd></div>
                    <div><dt className="inline font-medium">Tunggakan bunga: </dt><dd className="inline">{formatAmount(pinjaman.tgkBunga)}</dd></div>
                  </dl>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!createPinjamanTarget}
        onOpenChange={(open) => !open && setCreatePinjamanTarget(null)}
      >
        <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tambah Pinjaman</DialogTitle>
            <DialogDescription>
              Tambahkan fasilitas pinjaman untuk {createPinjamanTarget?.nama}.
            </DialogDescription>
          </DialogHeader>
          <PinjamanForm
            onSubmit={handleCreatePinjaman}
            isPending={createPinjaman.isPending}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

function formatAmount(value: number | null | undefined) {
  return value == null ? "-" : new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
}
