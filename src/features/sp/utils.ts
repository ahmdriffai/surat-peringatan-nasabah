import { SPWithNasabah } from "./schema";

export function isMyApprovalTurn(
  sp: SPWithNasabah,
  userId?: string,
): boolean {
  if (sp.status !== "MENUNGGU_APPROVAL" || !userId) return false;
  const nextApproval = sp.approvals.find((a) => a.status === "PENDING");
  return !!nextApproval && nextApproval.approverId === userId;
}

export function countMyPendingApprovals(
  sp: SPWithNasabah[],
  userId?: string,
): number {
  return sp.filter((s) => isMyApprovalTurn(s, userId)).length;
}
