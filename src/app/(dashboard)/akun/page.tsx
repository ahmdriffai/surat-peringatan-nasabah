"use client";

import AccountSettings from "@/features/user/components/account-settings";
import { useGetOwnProfile } from "@/features/user/hook";

export default function AkunPage() {
  const { data: user } = useGetOwnProfile();

  if (!user) return null;

  return (
    <div className="w-full space-y-4">
      <AccountSettings user={user} />
    </div>
  );
}
