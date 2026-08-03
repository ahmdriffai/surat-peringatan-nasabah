"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Table from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import RiwayatSPDialog from "@/features/customer/component/riwayat-sp-dialog";
import { Nasabah } from "@/generated/prisma/client";
import { Eye, History } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  formatDate,
  JENIS_LABEL,
  STATUS_LABEL,
  STATUS_VARIANT,
} from "../label";
import { SPWithNasabah } from "../schema";

interface Props {
  sp: SPWithNasabah[];
}

export default function SPList({ sp }: Props) {
  const [riwayatTarget, setRiwayatTarget] = useState<Nasabah | null>(null);

  return (
    <>
      <Table<SPWithNasabah>
        data={sp}
        keyExtractor={(row) => row.id}
        emptyMessage="Tidak ada data surat peringatan"
        columns={[
          {
            header: "No",
            accessor: () => <p>#</p>,
          },
          {
            header: "Nomor Surat",
            accessor: (row) => row.nomorSurat ?? "-",
          },
          {
            header: "Nasabah",
            accessor: (row) => (
              <div className="flex flex-col">
                <span>{row.nasabah.nama}</span>
                <span className="text-xs text-muted-foreground">
                  {row.nasabah.nomorRekening}
                </span>
              </div>
            ),
          },
          {
            header: "Jenis",
            accessor: (row) => JENIS_LABEL[row.jenis] ?? row.jenis,
          },
          {
            header: "Kolektibilitas",
            accessor: (row) => row.kolektibilitas,
          },
          {
            header: "Tanggal Surat",
            accessor: (row) => formatDate(row.tanggalSurat),
          },
          {
            header: "Jatuh Tempo",
            accessor: (row) => formatDate(row.tanggalJatuhTempo),
          },
          {
            header: "Status",
            accessor: (row) => (
              <Badge variant={STATUS_VARIANT[row.status]}>
                {STATUS_LABEL[row.status]}
              </Badge>
            ),
          },
          {
            header: "Action",
            accessor: (row) => (
              <div className="flex gap-2 justify-start">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setRiwayatTarget(row.nasabah)}
                    >
                      <History />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Riwayat surat peringatan nasabah</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="secondary" size="sm" asChild>
                      <Link href={`/surat-peringatan/${row.id}`}>
                        <Eye />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Detail surat peringatan</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            ),
          },
        ]}
      />

      <RiwayatSPDialog
        nasabah={riwayatTarget}
        onOpenChange={(open) => !open && setRiwayatTarget(null)}
      />
    </>
  );
}
