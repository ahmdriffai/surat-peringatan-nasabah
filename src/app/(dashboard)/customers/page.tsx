"use client";

import CustomerList from "@/features/customer/component/customer-list";
import CustomerForm from "@/features/customer/component/customer-form";
import { useCreateNasabah, useGetAllNasabah } from "@/features/customer/hook";
import { NasabahCreateInput } from "@/features/customer/schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

export default function CustomerPage() {
  const [open, setOpen] = useState<boolean>(false);

  const { mutate, isPending } = useCreateNasabah();
  const { data } = useGetAllNasabah();

  const handleSubmit = (data: NasabahCreateInput) => {
    mutate(data, { onSuccess: () => setOpen(false) });
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Tambah Nasabah</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tambah Nasabah</DialogTitle>
              <DialogDescription>
                Tambahkan data nasabah baru ke dalam sistem.
              </DialogDescription>
            </DialogHeader>
            <CustomerForm onSubmit={handleSubmit} isPending={isPending} />
          </DialogContent>
        </Dialog>
      </div>
      <CustomerList nasabah={data ?? []} />
    </div>
  );
}
