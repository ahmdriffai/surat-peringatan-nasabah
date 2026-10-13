"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Table from "@/components/ui/table-custom";
import { formatDateTime } from "@/features/sp/label";
import { Check, Loader2 } from "lucide-react";
import { useApproveMutasiJaminan } from "../hook";
import { JaminanWithDetails } from "@/services/jaminan/get-all";

type PendingMutasi = JaminanWithDetails["mutasi"][number] & { jaminan: JaminanWithDetails };

export default function JaminanApprovalList({ data }: { data: JaminanWithDetails[] }) {
  const approve = useApproveMutasiJaminan();
  const pending = data.flatMap((jaminan) =>
    jaminan.mutasi.filter((mutasi) => mutasi.approval?.status === "PENDING").map((mutasi) => ({ ...mutasi, jaminan } as PendingMutasi)),
  );

  return (
    <Table<PendingMutasi>
      data={pending}
      keyExtractor={(row) => row.id}
      emptyMessage="Tidak ada approval jaminan yang menunggu."
      columns={[
        { header: "Nasabah", accessor: (row) => <div><p className="font-medium">{row.jaminan.nasabah.nama}</p><p className="text-xs text-muted-foreground">{row.jaminan.nasabah.cif}</p></div> },
        { header: "Jaminan", accessor: (row) => <div><p>{row.jaminan.jenis}</p><p className="text-xs text-muted-foreground">{row.jaminan.pinjaman?.noPjm ?? row.jaminan.noPjm}</p></div> },
        { header: "Arah", accessor: (row) => <Badge variant={row.arah === "MASUK" ? "default" : "secondary"}>{row.arah === "MASUK" ? "Masuk" : "Keluar"}</Badge> },
        { header: "Dicatat", accessor: (row) => <div><p>{formatDateTime(row.terjadiPada)}</p><p className="text-xs text-muted-foreground">{row.dicatatOleh.nama}</p></div> },
        { header: "Status", accessor: () => <Badge variant="destructive">Belum di-approve</Badge> },
        { header: "Aksi", accessor: (row) => <Button size="sm" disabled={approve.isPending} onClick={() => approve.mutate({ id: row.id })}>{approve.isPending ? <Loader2 className="animate-spin" /> : <Check />} Approve</Button> },
      ]}
    />
  );
}
