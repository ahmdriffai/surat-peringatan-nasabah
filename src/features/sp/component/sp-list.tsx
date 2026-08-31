"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import RiwayatSPDialog from "@/features/customer/component/riwayat-sp-dialog";
import { Nasabah } from "@/generated/prisma/client";
import { JenisSP, StatusSP } from "@/generated/prisma/enums";
import { Eye, History, Search } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  formatDate,
  JENIS_LABEL,
  STATUS_BADGE_CLASS,
  STATUS_LABEL,
} from "../label";
import { SPWithNasabah } from "../schema";
import Table from "@/components/ui/table-custom";

interface Props {
  sp: SPWithNasabah[];
}

const STATUS_FILTER_OPTIONS = Object.values(StatusSP);
const JENIS_FILTER_OPTIONS = Object.values(JenisSP);

export default function SPList({ sp }: Props) {
  const { data: session } = useSession();
  const isPetugas = session?.user.role === "PETUGAS";

  const [riwayatTarget, setRiwayatTarget] = useState<Nasabah | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusSP | "ALL">("ALL");
  const [jenisFilter, setJenisFilter] = useState<JenisSP | "ALL">("ALL");
  const [showAllPetugas, setShowAllPetugas] = useState(false);

  const filteredSP = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return sp.filter((row) => {
      if (isPetugas && !showAllPetugas && row.petugasId !== session?.user.id)
        return false;
      if (statusFilter !== "ALL" && row.status !== statusFilter) return false;
      if (jenisFilter !== "ALL" && row.jenis !== jenisFilter) return false;

      if (!keyword) return true;

      return (
        row.nomorSurat?.toLowerCase().includes(keyword) ||
        row.nasabah.nama.toLowerCase().includes(keyword) ||
        row.nasabah.nomorRekening.toLowerCase().includes(keyword)
      );
    });
  }, [
    sp,
    search,
    statusFilter,
    jenisFilter,
    isPetugas,
    showAllPetugas,
    session?.user,
  ]);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-55">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari nomor surat, nama, atau nomor rekening..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as StatusSP | "ALL")}
        >
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Status</SelectItem>
            {STATUS_FILTER_OPTIONS.map((status) => (
              <SelectItem key={status} value={status}>
                {STATUS_LABEL[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={jenisFilter}
          onValueChange={(value) => setJenisFilter(value as JenisSP | "ALL")}
        >
          <SelectTrigger className="w-50">
            <SelectValue placeholder="Semua Jenis" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Jenis</SelectItem>
            {JENIS_FILTER_OPTIONS.map((jenis) => (
              <SelectItem key={jenis} value={jenis}>
                {JENIS_LABEL[jenis] ?? jenis}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isPetugas && (
          <div className="flex items-center gap-2">
            <Checkbox
              id="show-all-petugas"
              checked={showAllPetugas}
              onCheckedChange={(checked) => setShowAllPetugas(checked === true)}
            />
            <Label htmlFor="show-all-petugas" className="font-normal">
              Tampilkan surat semua petugas
            </Label>
          </div>
        )}
      </div>

      <Table<SPWithNasabah>
        data={filteredSP}
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
            header: "Petugas",
            accessor: (row) => row.petugas?.nama ?? "-",
          },
          {
            header: "Tanggal Surat",
            accessor: (row) => formatDate(row.tanggalSurat),
          },
          // {
          //   header: "Jatuh Tempo",
          //   accessor: (row) => formatDate(row.tanggalJatuhTempo),
          // },
          {
            header: "Status",
            accessor: (row) => (
              <Badge variant="outline" className={STATUS_BADGE_CLASS[row.status]}>
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
