"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useGetAllNasabah } from "@/features/customer/hook";
import JaminanForm from "@/features/jaminan/component/jaminan-form";
import JaminanList from "@/features/jaminan/component/jaminan-list";
import { useCreateJaminan, useGetAllJaminan } from "@/features/jaminan/hook";
import { JaminanCreateInput } from "@/features/jaminan/schema";
import { useState } from "react";

export default function JaminanPinjamanPage() {
  const [open, setOpen] = useState(false);
  const { data: nasabah = [] } = useGetAllNasabah();
  const { data: jaminan = [] } = useGetAllJaminan();
  const create = useCreateJaminan();

  const submit = (data: JaminanCreateInput, bukti?: File) => {
    create.mutate({ data, bukti }, { onSuccess: () => setOpen(false) });
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Jaminan Pinjaman</h2>
          <p className="mt-1 text-muted-foreground">
            Kelola data jaminan dan catat setiap keluar-masuknya.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button>Tambah Jaminan</Button></DialogTrigger>
          <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tambah Jaminan Pinjaman</DialogTitle>
              <DialogDescription>
                Jaminan baru otomatis dicatat sebagai transaksi masuk.
              </DialogDescription>
            </DialogHeader>
            <JaminanForm nasabah={nasabah} onSubmit={submit} isPending={create.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      <JaminanList data={jaminan} nasabah={nasabah} />
    </div>
  );
}
