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
import SPForm from "@/features/sp/component/sp-form";
import SPList from "@/features/sp/component/sp-list";
import { useCreateSP, useGetAllSP } from "@/features/sp/hook";
import { SPCreateInput } from "@/features/sp/schema";
import { useState } from "react";

export default function SuratPeringatanPage() {
  const [open, setOpen] = useState<boolean>(false);

  const { mutate, isPending } = useCreateSP();
  const { data: nasabah } = useGetAllNasabah();
  const { data: sp } = useGetAllSP();

  const handleSubmit = (data: SPCreateInput) => {
    mutate(data, { onSuccess: () => setOpen(false) });
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={() => setOpen(!open)}>
          <DialogTrigger asChild>
            <Button>Buat Surat Peringatan</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Buat surat peringatan</DialogTitle>
              <DialogDescription>
                Lengkapi data berikut untuk membuat surat peringatan baru.
              </DialogDescription>
            </DialogHeader>
            <SPForm
              onSubmit={handleSubmit}
              isPending={isPending}
              nasabah={nasabah ?? []}
            />
          </DialogContent>
        </Dialog>
      </div>

      <SPList sp={sp ?? []} />
    </div>
  );
}
