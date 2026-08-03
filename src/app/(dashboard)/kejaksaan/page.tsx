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
import KejaksaanForm from "@/features/kejaksaan/component/kejaksaan-form";
import KejaksaanList from "@/features/kejaksaan/component/kejaksaan-list";
import {
  useCreateKepalaKejaksaan,
  useGetAllKepalaKejaksaan,
} from "@/features/kejaksaan/hook";
import { KepalaKejaksaanInput } from "@/features/kejaksaan/schema";
import { useState } from "react";

export default function KejaksaanPage() {
  const [open, setOpen] = useState<boolean>(false);

  const { mutate, isPending } = useCreateKepalaKejaksaan();
  const { data } = useGetAllKepalaKejaksaan();

  const handleSubmit = (data: KepalaKejaksaanInput) => {
    mutate(data, { onSuccess: () => setOpen(false) });
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={() => setOpen(!open)}>
          <DialogTrigger asChild>
            <Button>Tambah Kepala Kejaksaan Negeri</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tambah Kepala Kejaksaan Negeri</DialogTitle>
              <DialogDescription>
                Data ini dipakai sebagai Penerima Kuasa pada surat Kuasa
                Khusus (SKK).
              </DialogDescription>
            </DialogHeader>
            <KejaksaanForm onSubmit={handleSubmit} isPending={isPending} />
          </DialogContent>
        </Dialog>
      </div>

      <KejaksaanList kejaksaan={data ?? []} />
    </div>
  );
}
