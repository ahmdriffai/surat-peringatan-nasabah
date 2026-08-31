"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EnrichedLoanData } from "@/services/external/loans";
import {
  AlertCircle,
  Building2,
  Calendar,
  Check,
  CreditCard,
  Database,
  Loader2,
  RefreshCw,
  Search,
  User,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import { useSearchExternalLoans } from "../hook";
import { formatCurrency, KOLEKTIBILITAS_LABEL } from "../label";

const CABANG_OPTIONS = [
  { value: "01", label: "01 — Kantor Pusat" },
  { value: "02", label: "02 — Cabang Wonosobo" },
  { value: "03", label: "03 — Cabang Kertek" },
  { value: "04", label: "04 — Cabang Garung" },
  { value: "05", label: "05 — Cabang Kepil" },
  { value: "06", label: "06 — Cabang Sapuran" },
  { value: "07", label: "07 — Cabang Kaliwiro" },
  { value: "08", label: "08 — Cabang Wadaslintang" },
  { value: "09", label: "09 — Cabang Selomerto" },
  { value: "10", label: "10 — Cabang Mojotengah" },
];

function getKolektibilitasBadgeVariant(col?: string | number) {
  const colNum = Number(col);
  switch (colNum) {
    case 1:
      return "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-300";
    case 2:
      return "bg-amber-500/15 text-amber-700 border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-300";
    case 3:
      return "bg-orange-500/15 text-orange-700 border-orange-500/30 dark:bg-orange-500/20 dark:text-orange-300";
    case 4:
      return "bg-rose-500/15 text-rose-700 border-rose-500/30 dark:bg-rose-500/20 dark:text-rose-300";
    case 5:
      return "bg-red-600/15 text-red-700 border-red-600/30 dark:bg-red-600/20 dark:text-red-300";
    default:
      return "bg-muted text-muted-foreground";
  }
}

interface Props {
  onSelectLoan: (loan: EnrichedLoanData) => void;
  selectedLoan: EnrichedLoanData | null;
  onClearSelection: () => void;
}

export default function LoanSearch({
  onSelectLoan,
  selectedLoan,
  onClearSelection,
}: Props) {
  const [query, setQuery] = useState("");
  const [kodecabang, setKodecabang] = useState("01");
  const [searchField, setSearchField] = useState<"auto" | "nama" | "cif" | "nik" | "nopjm">("auto");
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState<EnrichedLoanData[]>([]);

  const { mutate: search, isPending } = useSearchExternalLoans();

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery) return;

    // Tentukan parameter pencarian berdasarkan mode
    let nama = "";
    let cif = "";
    let nik = "";
    let nopjm = "";

    if (searchField === "auto") {
      // Deteksi otomatis jika numerik panjang (NIK) atau format nomor pinjaman (ada titik)
      if (/^\d{16}$/.test(cleanQuery)) {
        nik = cleanQuery;
      } else if (/^\d{1,8}$/.test(cleanQuery)) {
        cif = cleanQuery;
      } else if (cleanQuery.includes(".")) {
        nopjm = cleanQuery;
      } else {
        nama = cleanQuery;
      }
    } else if (searchField === "nama") {
      nama = cleanQuery;
    } else if (searchField === "cif") {
      cif = cleanQuery;
    } else if (searchField === "nik") {
      nik = cleanQuery;
    } else if (searchField === "nopjm") {
      nopjm = cleanQuery;
    }

    setHasSearched(true);
    search(
      {
        kodecabang,
        nama,
        cif,
        nik,
        nopjm,
      },
      {
        onSuccess: (data) => {
          setSearchResults(data || []);
        },
      },
    );
  };

  if (selectedLoan) {
    return (
      <div className="sm:col-span-2 rounded-xl border border-primary/20 bg-primary/5 p-4 transition-all">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-base text-foreground">
                {selectedLoan.Nama}
              </span>
              <Badge variant="outline" className="font-mono text-xs">
                CIF: {selectedLoan.NasabahID}
              </Badge>
              <Badge variant="outline" className="font-mono text-xs">
                NIK: {selectedLoan.NIK}
              </Badge>
              {selectedLoan.isRegisteredInDb ? (
                <Badge
                  variant="outline"
                  className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                >
                  <UserCheck className="mr-1 size-3" />
                  Terdaftar di Database
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300"
                >
                  <UserPlus className="mr-1 size-3" />
                  Nasabah Baru (Auto Simpan)
                </Badge>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              {selectedLoan.Alamat || "Alamat tidak tersedia"}
              {selectedLoan.Phone ? ` • Telp: ${selectedLoan.Phone}` : ""}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClearSelection}
            className="shrink-0"
          >
            <RefreshCw className="mr-1.5 size-3.5" />
            Ganti Pinjaman
          </Button>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 border-t border-primary/10 pt-3 text-xs sm:grid-cols-4">
          <div>
            <span className="text-muted-foreground">No. Pinjaman (PK):</span>
            <p className="font-medium font-mono text-foreground">
              {selectedLoan.NoPjm}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Fasilitas:</span>
            <p className="font-medium text-foreground">
              {selectedLoan.JnsPjm || "-"}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Plafond:</span>
            <p className="font-medium text-foreground">
              {formatCurrency(Math.abs(selectedLoan.Plafond || 0))}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Baki Debet / Saldo:</span>
            <p className="font-medium text-foreground">
              {formatCurrency(Math.abs(selectedLoan.Saldo || 0))}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Kolektibilitas:</span>
            <p className="font-medium">
              <span
                className={`inline-block rounded px-1.5 py-0.5 font-bold ${getKolektibilitasBadgeVariant(
                  selectedLoan.Col,
                )}`}
              >
                Col {selectedLoan.Col} —{" "}
                {KOLEKTIBILITAS_LABEL[Number(selectedLoan.Col) || 1]}
              </span>
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Tgk. Pokok:</span>
            <p className="font-medium text-foreground">
              {formatCurrency(Math.abs(selectedLoan.TgkPokok || 0))}{" "}
              <span className="text-muted-foreground">
                ({selectedLoan.TgkPokokHari || 0} hr)
              </span>
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Tgk. Bunga:</span>
            <p className="font-medium text-foreground">
              {formatCurrency(Math.abs(selectedLoan.TgkBunga || 0))}{" "}
              <span className="text-muted-foreground">
                ({selectedLoan.TgkBungaHAri ?? selectedLoan.TgkBungaHari ?? 0}{" "}
                hr)
              </span>
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Cabang / Unit:</span>
            <p className="font-medium text-foreground">
              {selectedLoan.Unit || selectedLoan.KodeCabang || "-"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sm:col-span-2 space-y-3 rounded-xl border bg-muted/20 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="size-4 text-primary" />
          <h3 className="font-semibold text-sm text-foreground">
            Cari Data Nasabah & Pinjaman (Core Banking)
          </h3>
        </div>
        <Badge variant="outline" className="text-[10px] uppercase font-mono">
          API Core Banking
        </Badge>
      </div>

      <form onSubmit={handleSearch} className="space-y-2">
        <div className="grid gap-2 sm:grid-cols-12">
          <div className="sm:col-span-3">
            <Select value={kodecabang} onValueChange={setKodecabang}>
              <SelectTrigger className="w-full text-xs">
                <SelectValue placeholder="Pilih Cabang" />
              </SelectTrigger>
              <SelectContent>
                {CABANG_OPTIONS.map((c) => (
                  <SelectItem key={c.value} value={c.value} className="text-xs">
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-6 flex gap-2">
            <Input
              type="text"
              placeholder="Ketik Nama / CIF / NIK / No. Pinjaman..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="sm:col-span-3">
            <Button
              type="submit"
              disabled={isPending || !query.trim()}
              className="w-full text-xs"
            >
              {isPending ? (
                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
              ) : (
                <Search className="mr-1.5 size-3.5" />
              )}
              {isPending ? "Mencari..." : "Cari Pinjaman"}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span>Mode pencarian:</span>
          {(
            [
              { key: "auto", label: "Otomatis" },
              { key: "nama", label: "Nama" },
              { key: "cif", label: "CIF" },
              { key: "nik", label: "NIK" },
              { key: "nopjm", label: "No. Pinjaman" },
            ] as const
          ).map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setSearchField(m.key)}
              className={`rounded px-1.5 py-0.5 transition-colors ${
                searchField === m.key
                  ? "bg-primary/20 text-primary font-medium"
                  : "hover:bg-muted text-muted-foreground"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </form>

      {/* Hasil Pencarian */}
      {hasSearched && (
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Hasil pencarian:{" "}
              <strong className="text-foreground">{searchResults.length}</strong> data
              ditemukan
            </span>
          </div>

          {searchResults.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
              <AlertCircle className="mx-auto mb-2 size-6 text-muted-foreground/60" />
              <p className="font-medium text-foreground">
                Data pinjaman tidak ditemukan
              </p>
              <p className="mt-0.5">
                Pastikan nama, CIF, NIK, atau nomor pinjaman yang dimasukkan
                sesuai di cabang terpilih.
              </p>
            </div>
          ) : (
            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {searchResults.map((item, idx) => {
                const colNum = Number(item.Col) || 1;
                const tgkPokok = Math.abs(item.TgkPokok || 0);
                const tgkBunga = Math.abs(item.TgkBunga || 0);
                const totalTgk = tgkPokok + tgkBunga;

                return (
                  <Card
                    key={`${item.NoPjm}-${idx}`}
                    className="overflow-hidden border transition-all hover:border-primary/50 hover:shadow-xs"
                  >
                    <CardContent className="p-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-sm text-foreground">
                              {item.Nama}
                            </span>
                            <Badge variant="outline" className="font-mono text-[10px]">
                              CIF: {item.NasabahID}
                            </Badge>
                            <Badge variant="outline" className="font-mono text-[10px]">
                              NIK: {item.NIK}
                            </Badge>
                            {item.isRegisteredInDb ? (
                              <Badge
                                variant="outline"
                                className="border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-700 dark:text-emerald-300"
                              >
                                <UserCheck className="mr-1 size-2.5" />
                                Terdaftar di DB
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="border-blue-500/30 bg-blue-500/10 text-[10px] text-blue-700 dark:text-blue-300"
                              >
                                <UserPlus className="mr-1 size-2.5" />
                                Nasabah Baru
                              </Badge>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1 font-mono font-medium text-foreground">
                              <CreditCard className="size-3 text-muted-foreground" />
                              {item.NoPjm}
                            </span>
                            <span>•</span>
                            <span>{item.JnsPjm || "Pinjaman"}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Building2 className="size-3 text-muted-foreground" />
                              {item.Unit || item.KodeCabang}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => onSelectLoan(item)}
                            className="text-xs h-8"
                          >
                            <Check className="mr-1 size-3.5" />
                            Pilih Pinjaman
                          </Button>
                        </div>
                      </div>

                      {/* Rincian Finansial */}
                      <div className="mt-2.5 grid grid-cols-2 gap-2 rounded-lg bg-muted/40 p-2.5 text-xs sm:grid-cols-4">
                        <div>
                          <span className="text-[11px] text-muted-foreground">
                            Plafond:
                          </span>
                          <p className="font-medium font-mono text-foreground">
                            {formatCurrency(Math.abs(item.Plafond || 0))}
                          </p>
                        </div>
                        <div>
                          <span className="text-[11px] text-muted-foreground">
                            Baki Debet / Saldo:
                          </span>
                          <p className="font-medium font-mono text-foreground">
                            {formatCurrency(Math.abs(item.Saldo || 0))}
                          </p>
                        </div>
                        <div>
                          <span className="text-[11px] text-muted-foreground">
                            Kolektibilitas:
                          </span>
                          <p>
                            <span
                              className={`inline-block rounded px-1.5 py-0.2 font-semibold text-[11px] ${getKolektibilitasBadgeVariant(
                                item.Col,
                              )}`}
                            >
                              Col {item.Col} — {KOLEKTIBILITAS_LABEL[colNum]}
                            </span>
                          </p>
                        </div>
                        <div>
                          <span className="text-[11px] text-muted-foreground">
                            Total Tunggakan:
                          </span>
                          <p className="font-bold font-mono text-destructive">
                            {formatCurrency(totalTgk)}
                          </p>
                        </div>

                        <div className="col-span-2 sm:col-span-4 flex flex-wrap items-center justify-between border-t pt-1.5 text-[11px] text-muted-foreground">
                          <span>
                            Tgk. Pokok:{" "}
                            <strong className="text-foreground font-mono">
                              {formatCurrency(tgkPokok)}
                            </strong>{" "}
                            ({item.TgkPokokHari || 0} hari)
                          </span>
                          <span>
                            Tgk. Bunga:{" "}
                            <strong className="text-foreground font-mono">
                              {formatCurrency(tgkBunga)}
                            </strong>{" "}
                            ({item.TgkBungaHAri ?? item.TgkBungaHari ?? 0} hari)
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
