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
import Table from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { KepalaKejaksaan } from "@/generated/prisma/client";
import { Loader2, Pen, Trash2, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { useDeleteKepalaKejaksaan, useEditKepalaKejaksaan } from "../hook";
import { KepalaKejaksaanInput } from "../schema";
import KejaksaanForm from "./kejaksaan-form";

interface Props {
  kejaksaan: KepalaKejaksaan[];
}

export default function KejaksaanList({ kejaksaan }: Props) {
  const [editTarget, setEditTarget] = useState<KepalaKejaksaan | null>(null);

  const { mutate: mutateEdit, isPending: isEditPending } =
    useEditKepalaKejaksaan();
  const { mutate: mutateDelete, isPending: isDeletePending } =
    useDeleteKepalaKejaksaan();

  const handleEditSubmit = (data: KepalaKejaksaanInput) => {
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
      <Table<KepalaKejaksaan>
        data={kejaksaan}
        keyExtractor={(row) => row.id}
        emptyMessage="Tidak ada data Kepala Kejaksaan Negeri"
        columns={[
          {
            header: "No",
            accessor: () => <p>#</p>,
          },
          {
            header: "Nama",
            accessor: "nama",
          },
          {
            header: "Jabatan",
            accessor: "jabatan",
          },
          {
            header: "Pangkat",
            accessor: (row) => row.pangkat ?? "-",
          },
          {
            header: "NIP",
            accessor: (row) => row.nip ?? "-",
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
                      onClick={() => setEditTarget(row)}
                    >
                      <Pen />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit</p>
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
                      <AlertDialogTitle>Hapus data?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Data {row.nama} akan dihapus secara permanen.
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
                        {isDeletePending ? "Menghapus..." : "Hapus"}
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
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Kepala Kejaksaan Negeri</DialogTitle>
            <DialogDescription>
              Perbarui data berikut lalu simpan perubahan.
            </DialogDescription>
          </DialogHeader>
          {editTarget && (
            <KejaksaanForm
              key={editTarget.id}
              defaultValues={{
                nama: editTarget.nama,
                jabatan: editTarget.jabatan,
                pangkat: editTarget.pangkat ?? "",
                nip: editTarget.nip ?? "",
                alamat: editTarget.alamat ?? "",
              }}
              submitLabel="Simpan perubahan"
              onSubmit={handleEditSubmit}
              isPending={isEditPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
