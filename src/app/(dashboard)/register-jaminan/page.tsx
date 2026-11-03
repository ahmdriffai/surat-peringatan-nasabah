"use client";

import RegisterJaminanList from "@/features/jaminan/component/register-jaminan-list";
import { useGetAllJaminan } from "@/features/jaminan/hook";

export default function RegisterJaminanPage() {
  const { data = [], isLoading } = useGetAllJaminan();

  return (
    <div className="w-full space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Register Jaminan Pinjaman</h2>
        <p className="mt-1 text-muted-foreground">
          Daftar seluruh jaminan pinjaman yang tercatat.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Memuat data jaminan...</p>
      ) : (
        <RegisterJaminanList data={data} />
      )}
    </div>
  );
}
