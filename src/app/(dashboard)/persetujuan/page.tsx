"use client";

import SPList from "@/features/sp/component/sp-list";
import { useGetAllSP } from "@/features/sp/hook";
import { isMyApprovalTurn } from "@/features/sp/utils";
import { useSession } from "next-auth/react";

export default function PersetujuanPage() {
  const { data: session } = useSession();
  const { data: sp } = useGetAllSP();

  const pending = (sp ?? []).filter((s) =>
    isMyApprovalTurn(s, session?.user.id),
  );

  return (
    <div className="w-full space-y-4">
      <SPList sp={pending} />
    </div>
  );
}
