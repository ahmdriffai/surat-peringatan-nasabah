"use client";

import CustomerList from "@/features/customer/component/customer-list";
import { useCreateNasabah, useGetAllNasabah } from "@/features/customer/hook";
import { NasabahCreateInput } from "@/features/customer/schema";
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
      <CustomerList nasabah={data ?? []} />
    </div>
  );
}
