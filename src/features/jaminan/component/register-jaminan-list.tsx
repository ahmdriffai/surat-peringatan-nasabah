"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Table from "@/components/ui/table-custom";
import { formatDate } from "@/features/sp/label";
import { StatusJaminan } from "@/generated/prisma/enums";
import { JaminanWithDetails } from "@/services/jaminan/get-all";
import { Download } from "lucide-react";
import { useMemo, useState } from "react";

const STATUS_LABEL: Record<StatusJaminan, string> = {
  TERSIMPAN: "Tersimpan",
  DIBAWA_KELUAR: "Dibawa keluar",
  SELESAI_PENGIKATAN: "Selesai pengikatan",
  LUNAS: "Lunas",
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function exportExcel(rows: JaminanWithDetails[]) {
  const headers = [
    "No",
    "Nama Nasabah",
    "CIF",
    "No. Pinjaman",
    "Jenis Jaminan",
    "Nomor Dokumen",
    "Atas Nama",
    "Notaris",
    "Lokasi Penyimpanan",
    "Status",
    "Tanggal Diterima",
    "Deskripsi",
    "Catatan",
  ];

  const body = rows
    .map((row, index) => {
      const values = [
        String(index + 1),
        row.nasabah.nama,
        row.nasabah.cif,
        row.pinjaman?.noPjm ?? row.noPjm,
        row.jenis,
        row.nomorDokumen ?? "",
        row.atasNama ?? "",
        row.notaris ?? "",
        row.lokasiPenyimpanan ?? "",
        STATUS_LABEL[row.status],
        row.tanggalDiterima ? formatDate(row.tanggalDiterima) : "",
        row.deskripsi ?? "",
        row.catatan ?? "",
      ];

      return `<tr>${values.map((value) => `<td>${escapeHtml(value)}</td>`).join("")}</tr>`;
    })
    .join("");

  const html = `
    <html><head><meta charset="UTF-8"></head><body>
      <table border="1">
        <thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
        <tbody>${body}</tbody>
      </table>
    </body></html>`;
  const blob = new Blob([html], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `register-jaminan-${new Date().toISOString().slice(0, 10)}.xls`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function RegisterJaminanList({
  data,
}: {
  data: JaminanWithDetails[];
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusJaminan | "ALL">("ALL");

  const filteredData = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("id-ID");
    return data.filter((row) => {
      const text = [
        row.nasabah.nama,
        row.nasabah.cif,
        row.pinjaman?.noPjm,
        row.noPjm,
        row.jenis,
        row.nomorDokumen,
        row.atasNama,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("id-ID");

      return (!query || text.includes(query)) &&
        (status === "ALL" || row.status === status);
    });
  }, [data, search, status]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4">
        <div>
          <p className="font-medium">Daftar seluruh jaminan</p>
          <p className="text-sm text-muted-foreground">
            Menampilkan {filteredData.length} dari {data.length} jaminan
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari nasabah, CIF, pinjaman..."
            className="w-64"
          />
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as StatusJaminan | "ALL")
            }
            className="h-10 rounded-3xl border border-transparent bg-input/50 px-3 text-sm"
          >
            <option value="ALL">Semua status</option>
            {Object.values(StatusJaminan).map((value) => (
              <option key={value} value={value}>
                {STATUS_LABEL[value]}
              </option>
            ))}
          </select>
          <Button type="button" onClick={() => exportExcel(filteredData)}>
            <Download className="size-4" />
            Export Excel
          </Button>
        </div>
      </div>

      <Table<JaminanWithDetails>
        data={filteredData}
        keyExtractor={(row) => row.id}
        emptyMessage="Belum ada data jaminan"
        columns={[
          {
            header: "No",
            accessor: (row) => filteredData.indexOf(row) + 1,
          },
          {
            header: "Nasabah",
            accessor: (row) => (
              <div>
                <p className="font-medium">{row.nasabah.nama}</p>
                <p className="text-xs text-muted-foreground">{row.nasabah.cif}</p>
              </div>
            ),
          },
          {
            header: "No. Pinjaman",
            accessor: (row) => row.pinjaman?.noPjm ?? row.noPjm,
          },
          {
            header: "Jenis Jaminan",
            accessor: (row) => row.jenis,
          },
          {
            header: "Nomor Dokumen",
            accessor: (row) => row.nomorDokumen ?? "-",
          },
          {
            header: "Notaris",
            accessor: (row) => row.notaris ?? "-",
          },
          {
            header: "Atas Nama",
            accessor: (row) => row.atasNama ?? "-",
          },
          {
            header: "Status",
            accessor: (row) => <Badge>{STATUS_LABEL[row.status]}</Badge>,
          },
          {
            header: "Tanggal Diterima",
            accessor: (row) =>
              row.tanggalDiterima ? formatDate(row.tanggalDiterima) : "-",
          },
        ]}
      />
    </div>
  );
}
