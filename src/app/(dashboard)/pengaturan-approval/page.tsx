"use client";

import JenisSPApproverSettings from "@/features/jenis-sp-approver/component/jenis-sp-approver-settings";
import { useGetAllUsers } from "@/features/user/hook";

export default function PengaturanApprovalPage() {
  const { data: users } = useGetAllUsers();

  const approvers = (users ?? []).filter(
    (u) => u.role === "APPROVER" && u.aktif,
  );

  return (
    <div className="w-full space-y-4">
      <JenisSPApproverSettings approvers={approvers} />
    </div>
  );
}
