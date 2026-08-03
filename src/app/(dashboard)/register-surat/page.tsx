"use client";

import RegisterSuratList from "@/features/sp/component/register-surat-list";
import { useGetAllSP } from "@/features/sp/hook";

export default function RegisterSuratPage() {
  const { data: sp } = useGetAllSP();

  const registered = (sp ?? []).filter((s) => s.nomorSurat);

  return (
    <div className="w-full space-y-4">
      <RegisterSuratList sp={registered} />
    </div>
  );
}
