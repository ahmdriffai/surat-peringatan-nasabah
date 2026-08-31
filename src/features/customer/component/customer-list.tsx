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
import { Nasabah } from "@/generated/prisma/client";
import { History, Loader2, Pen, Trash2, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { useDeleteNasabah, useEditNasabah } from "../hook";
import { NasabahCreateInput } from "../schema";
import CustomerForm from "./customer-form";
import RiwayatSPDialog from "./riwayat-sp-dialog";

interface Props {
  nasabah: Nasabah[];
}

export default function CustomerList({ nasabah }: Props) {
  const [editTarget, setEditTarget] = useState<Nasabah | null>(null);
  const [riwayatTarget, setRiwayatTarget] = useState<Nasabah | null>(null);

  const { mutate: mutateEdit, isPending: isEditPending } = useEditNasabah();
  const { mutate: mutateDelete, isPending: isDeletePending } =
    useDeleteNasabah();

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

  return (
    <>
      <Table<Nasabah>
        data={nasabah}
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
    </>
  );
}
