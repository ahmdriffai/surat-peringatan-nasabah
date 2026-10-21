"use client";

import { useSession } from "next-auth/react";
import JaminanApprovalList from "@/features/jaminan/component/jaminan-approval-list";
import { useGetAllJaminan } from "@/features/jaminan/hook";

export default function ApproveJaminanPage() {
  const { data: session } = useSession();
  const { data: jaminan = [] } = useGetAllJaminan(session?.user.approverJaminan === true);

  if (!session?.user.approverJaminan) {
    return <p className="text-sm text-muted-foreground">Halaman ini hanya untuk approver jaminan.</p>;
  }

  return (
    <div className="w-full space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Approve Jaminan</h2>
        <p className="mt-1 text-muted-foreground">Periksa dan setujui setiap jaminan yang masuk atau keluar.</p>
      </div>
      <JaminanApprovalList data={jaminan} />
    </div>
  );
}
