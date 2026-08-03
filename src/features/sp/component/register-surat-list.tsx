import { Button } from "@/components/ui/button";
import Table from "@/components/ui/table";
import { FileText } from "lucide-react";
import Link from "next/link";
import { formatDate, JENIS_LABEL } from "../label";
import { SPWithNasabah } from "../schema";

interface Props {
  sp: SPWithNasabah[];
}

export default function RegisterSuratList({ sp }: Props) {
  return (
    <Table<SPWithNasabah>
      data={sp}
      keyExtractor={(row) => row.id}
      emptyMessage="Belum ada surat yang memiliki nomor surat"
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
          header: "Surat",
          accessor: (row) => (
            <Button variant="secondary" size="sm" asChild>
              <Link href={`/surat-peringatan/${row.id}/cetak`} target="_blank">
                <FileText />
                Lihat Surat
              </Link>
            </Button>
          ),
        },
      ]}
    />
  );
}
