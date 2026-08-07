import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Table from "@/components/ui/table";
import { FileText } from "lucide-react";
import Link from "next/link";
import {
  formatDate,
  JENIS_LABEL,
  STATUS_BADGE_CLASS,
  STATUS_LABEL,
} from "../label";
import { SPWithNasabah } from "../schema";

interface Props {
  sp: SPWithNasabah[];
}

export default function ArsipList({ sp }: Props) {
  return (
    <Table<SPWithNasabah>
      data={sp}
      keyExtractor={(row) => row.id}
      emptyMessage="Belum ada arsip surat yang diunggah"
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
          header: "Tanggal Surat",
          accessor: (row) => formatDate(row.tanggalSurat),
        },
        {
          header: "Status",
          accessor: (row) => (
            <Badge variant="outline" className={STATUS_BADGE_CLASS[row.status]}>
              {STATUS_LABEL[row.status]}
            </Badge>
          ),
        },
        {
          header: "Arsip",
          accessor: (row) => (
            <Button variant="secondary" size="sm" asChild>
              <Link href={row.arsipPdf ?? "#"} target="_blank">
                <FileText />
                Buka PDF
              </Link>
            </Button>
          ),
        },
      ]}
    />
  );
}
