"use client";

import { Button } from "@/components/ui/button";
import SPDetail from "@/features/sp/component/sp-detail";
import SPStatusActions from "@/features/sp/component/sp-status-actions";
import { useGetDetailSP } from "@/features/sp/hook";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function SuratPeringatanDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: sp, isLoading } = useGetDetailSP(params.id);

  return (
    <div className="w-full space-y-4">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/surat-peringatan">
          <ChevronLeft className="size-4" />
          Kembali
        </Link>
      </Button>

      {isLoading && <p className="text-sm text-muted-foreground">Memuat...</p>}
      {!isLoading && !sp && (
        <p className="text-sm text-muted-foreground">
          Surat peringatan tidak ditemukan.
        </p>
      )}
      {sp && (
        <>
          <SPDetail sp={sp} />
          <SPStatusActions sp={sp} />
        </>
      )}
    </div>
  );
}
