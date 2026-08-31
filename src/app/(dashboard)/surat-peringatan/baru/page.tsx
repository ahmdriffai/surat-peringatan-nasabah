"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetAllNasabah } from "@/features/customer/hook";
import SPForm from "@/features/sp/component/sp-form";
import { useCreateSP } from "@/features/sp/hook";
import { SPCreateInput } from "@/features/sp/schema";
import { ChevronLeft, FilePlus2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function BuatSuratPeringatanPage() {
  const router = useRouter();
  const { mutate, isPending } = useCreateSP();
  const { data: nasabah } = useGetAllNasabah();

  const handleSubmit = (data: SPCreateInput) => {
    mutate(data, {
      onSuccess: () => {
        router.push("/surat-peringatan");
      },
    });
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/surat-peringatan">
            <ChevronLeft className="size-4 mr-1" />
            Kembali ke Daftar Surat
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FilePlus2 className="size-5 text-primary" />
            <CardTitle className="text-lg">Buat Surat Peringatan Baru</CardTitle>
          </div>
          <CardDescription>
            Cari data pinjaman & nasabah dari Core Banking API untuk mengisi formulir secara otomatis, atau lengkapi data secara manual.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SPForm
            onSubmit={handleSubmit}
            isPending={isPending}
            nasabah={nasabah ?? []}
            submitLabel="Buat & Simpan Surat Peringatan"
          />
        </CardContent>
      </Card>
    </div>
  );
}
