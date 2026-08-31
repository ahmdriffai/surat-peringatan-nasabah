"use client";

import { Button } from "@/components/ui/button";
import SPList from "@/features/sp/component/sp-list";
import { useGetAllSP } from "@/features/sp/hook";
import { Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function SuratPeringatanPage() {
  const { data: session } = useSession();
  const isApprover = session?.user.role === "APPROVER";
  const { data: sp } = useGetAllSP();

  return (
    <div className="w-full space-y-4">
      {!isApprover && (
        <div className="flex justify-end">
          <Button asChild>
            <Link href="/surat-peringatan/baru">
              <Plus className="mr-1.5 size-4" />
              Buat Surat Peringatan
            </Link>
          </Button>
        </div>
      )}

      <SPList sp={sp ?? []} />
    </div>
  );
}
