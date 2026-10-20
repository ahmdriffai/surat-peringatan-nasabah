"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import LoanSearch from "@/features/sp/component/loan-search";
import { EnrichedLoanData } from "@/services/external/loans";
import { NasabahWithPinjaman } from "@/services/nasabah/get-all";
import { Check, ChevronDown, Database, Loader2, PencilLine } from "lucide-react";
import { useState } from "react";
import { ZodError } from "zod";
import { JaminanCreateInput, JaminanCreateInputSchema } from "../schema";

type FormValues = {
  nasabahId: string;
  noPjm: string;
  jenis: string;
  nomorDokumen: string;
  deskripsi: string;
  atasNama: string;
  nilaiTaksiran: string;
  lokasiPenyimpanan: string;
  status: "TERSIMPAN" | "DIBAWA_KELUAR" | "SELESAI_PENGIKATAN";
  tanggalDiterima: string;
  diserahkanKepada: string;
  diterimaDari: string;
  catatan: string;
  nasabahData?: {
    cif: string;
    nama: string;
    nik: string;
    nomorRekening?: string;
    email?: string;
    telepon?: string;
    alamat?: string;
  };
};

interface Props {
  nasabah: NasabahWithPinjaman[];
  onSubmit: (data: JaminanCreateInput, bukti?: File) => void;
  isPending: boolean;
  defaultValues?: Partial<FormValues>;
  submitLabel?: string;
}

const emptyValues: FormValues = {
  nasabahId: "",
  noPjm: "",
  jenis: "",
  nomorDokumen: "",
  deskripsi: "",
  atasNama: "",
  nilaiTaksiran: "",
  lokasiPenyimpanan: "",
  status: "TERSIMPAN",
  tanggalDiterima: new Date().toISOString().slice(0, 10),
  diserahkanKepada: "",
  diterimaDari: "",
  catatan: "",
  nasabahData: undefined,
};

export default function JaminanForm({
  nasabah,
  onSubmit,
  isPending,
  defaultValues,
  submitLabel = "Simpan",
}: Props) {
  const [values, setValues] = useState({ ...emptyValues, ...defaultValues });
  const [bukti, setBukti] = useState<File>();
  const [error, setError] = useState("");
  const [selectedLoan, setSelectedLoan] = useState<EnrichedLoanData | null>(
    null,
  );
  const [source, setSource] = useState<"core" | "manual">("manual");
  const [nasabahSearch, setNasabahSearch] = useState("");
  const [nasabahOpen, setNasabahOpen] = useState(false);
  const [manualLoanMode, setManualLoanMode] = useState<"new" | "existing">(
    "new",
  );

  const filteredNasabah = nasabah.filter((item) => {
    const query = nasabahSearch.trim().toLowerCase();
    return (
      !query ||
      [item.nama, item.cif, item.nik, item.nomorRekening].some((value) =>
        value?.toLowerCase().includes(query),
      )
    );
  });

  const update = (key: keyof FormValues, value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  const handleSelectLoan = (loan: EnrichedLoanData) => {
    setSelectedLoan(loan);
    setValues((current) => ({
      ...current,
      nasabahId: loan.existingNasabahId || "",
      nasabahData: {
        cif: loan.NasabahID,
        nama: loan.Nama,
        nik: loan.NIK,
        nomorRekening: loan.NoPjm,
        email: loan.Email,
        telepon: loan.Phone,
        alamat: loan.Alamat,
      },
      noPjm: loan.NoPjm,
    }));
  };

  const submit = () => {
    try {
      setError("");
      const data = JaminanCreateInputSchema.parse(values);
      onSubmit(data, bukti);
    } catch (submissionError) {
      setError(
        submissionError instanceof ZodError
          ? (submissionError.issues[0]?.message ??
              "Periksa kembali data jaminan.")
          : submissionError instanceof Error
            ? submissionError.message
            : "Periksa kembali data jaminan.",
      );
    }
  };

  return (
    <FieldGroup className="gap-4 sm:grid sm:grid-cols-2">
      {!defaultValues && (
        <Field className="sm:col-span-2 rounded-2xl border bg-muted/20 p-4">
          <FieldLabel>Sumber data nasabah & pinjaman</FieldLabel>
          <div className="grid gap-2 sm:grid-cols-2">
            {(
              [
                [
                  "core",
                  "Core Banking",
                  "Cari data pinjaman dari sistem pusat.",
                  Database,
                ],
                [
                  "manual",
                  "Manual",
                  "Gunakan data dari database lokal.",
                  PencilLine,
                ],
              ] as const
            ).map(([value, label, description, Icon]) => (
              <button
                key={value}
                type="button"
                aria-pressed={source === value}
                onClick={() => {
                  setSource(value);
                  setSelectedLoan(null);
                  setValues((current) => ({
                    ...current,
                    nasabahId: "",
                    nasabahData: undefined,
                    noPjm: "",
                  }));
                }}
                className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-all ${source === value ? "border-primary bg-primary/10 text-primary shadow-sm" : "border-border bg-background hover:border-primary/40 hover:bg-primary/5"}`}
              >
                <Icon className="mt-0.5 size-4 shrink-0" />
                <span>
                  <span className="block text-sm font-semibold">{label}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {description}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </Field>
      )}
      {!defaultValues && source === "core" && (
        <LoanSearch
          selectedLoan={selectedLoan}
          onSelectLoan={handleSelectLoan}
          onClearSelection={() => {
            setSelectedLoan(null);
            setValues((current) => ({
              ...current,
              nasabahId: "",
              nasabahData: undefined,
              noPjm: "",
            }));
          }}
        />
      )}
      {(defaultValues || source === "manual") && (
        <Field>
          <FieldLabel htmlFor="nasabahId">Nasabah</FieldLabel>
          <div className="relative">
            <button
              type="button"
              id="nasabahId"
              aria-expanded={nasabahOpen}
              onClick={() => setNasabahOpen((open) => !open)}
              className="flex h-10 w-full items-center justify-between rounded-3xl border border-transparent bg-input/50 px-3 text-left text-sm outline-none focus:border-ring"
            >
              <span className={values.nasabahId ? "" : "text-muted-foreground"}>
                {nasabah.find((item) => item.id === values.nasabahId)
                  ? `${nasabah.find((item) => item.id === values.nasabahId)?.nama} — ${nasabah.find((item) => item.id === values.nasabahId)?.cif}`
                  : "Pilih nasabah"}
              </span>
              <ChevronDown className="size-4 text-muted-foreground" />
            </button>
            {nasabahOpen && (
              <div className="absolute z-50 mt-2 w-full rounded-2xl border bg-popover p-2 shadow-lg">
                <Input
                  autoFocus
                  placeholder="Cari nama, CIF, NIK, atau nomor rekening"
                  value={nasabahSearch}
                  onChange={(event) => setNasabahSearch(event.target.value)}
                />
                <div className="mt-2 max-h-56 overflow-y-auto">
                  {filteredNasabah.length ? (
                    filteredNasabah.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-accent"
                        onClick={() => {
                          update("nasabahId", item.id);
                          setValues((current) => ({ ...current, nasabahData: undefined }));
                          setManualLoanMode("new");
                          setNasabahSearch("");
                          setNasabahOpen(false);
                        }}
                      >
                        <span>{item.nama} — {item.cif}</span>
                        {item.id === values.nasabahId && <Check className="size-4" />}
                      </button>
                    ))
                  ) : (
                    <p className="px-3 py-2 text-sm text-muted-foreground">
                      Nasabah tidak ditemukan.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
          {/* Keep the selected value available to form semantics. */}
          <select
            tabIndex={-1}
            aria-hidden="true"
            className="sr-only"
            value={values.nasabahId}
            onChange={() => undefined}
          >
            <option value="">Pilih nasabah</option>
            {nasabah.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nama} — {item.cif}
              </option>
            ))}
          </select>
        </Field>
      )}
      {!defaultValues && source === "manual" && values.nasabahId && (
        <Field className="sm:col-span-2 rounded-xl border bg-muted/20 p-3">
          <FieldLabel>Data pinjaman manual</FieldLabel>
          <select
            className="h-10 rounded-3xl border border-transparent bg-background px-3 text-sm outline-none focus:border-ring"
            value={manualLoanMode}
            onChange={(event) =>
              setManualLoanMode(event.target.value as "new" | "existing")
            }
          >
            <option value="new">Pinjaman baru</option>
            <option value="existing">Gunakan pinjaman yang sudah ada</option>
          </select>
          {manualLoanMode === "existing" && (
            <select
              className="mt-2 h-10 rounded-3xl border border-transparent bg-background px-3 text-sm outline-none focus:border-ring"
              defaultValue=""
              onChange={(event) => {
                const loan = nasabah
                  .find((item) => item.id === values.nasabahId)
                  ?.pinjaman.find((item) => item.id === event.target.value);
                if (loan) update("noPjm", loan.noPjm);
              }}
            >
              <option value="">Pilih pinjaman nasabah</option>
              {nasabah
                .find((item) => item.id === values.nasabahId)
                ?.pinjaman.map((loan) => (
                  <option key={loan.id} value={loan.id}>
                    {loan.noPjm} — {loan.jenisFasilitas || "Pinjaman"}
                  </option>
                ))}
            </select>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            Nomor pinjaman yang sama akan menggunakan data pinjaman yang sudah
            ada.
          </p>
        </Field>
      )}
      <div className="sm:col-span-2 border-b pb-2 pt-2">
        <p className="text-sm font-semibold">Detail Jaminan</p>
        <p className="text-xs text-muted-foreground">
          Isi identitas pinjaman dan informasi dokumen jaminan.
        </p>
      </div>
      <Field>
        <FieldLabel htmlFor="noPjm">Nomor Pinjaman</FieldLabel>
        <Input
          id="noPjm"
          value={values.noPjm}
          onChange={(e) => update("noPjm", e.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="jenis">Jenis Jaminan *</FieldLabel>
        <select
          id="jenis"
          className="h-10 w-full rounded-3xl border border-transparent bg-input/50 px-3 text-sm outline-none focus:border-ring"
          value={values.jenis}
          onChange={(e) => update("jenis", e.target.value)}
        >
          <option value="">Pilih jenis jaminan</option>
          <option value="BPKB">BPKB</option>
          <option value="SHM">SHM</option>
          <option value="SHGB">SHGB</option>
          <option value="AJB">AJB</option>
          <option value="Deposito">Deposito</option>
          <option value="Emas">Emas</option>
          <option value="Kendaraan">Kendaraan</option>
          <option value="Lainnya">Lainnya</option>
        </select>
      </Field>
      <Field>
        <FieldLabel htmlFor="nomorDokumen">Nomor Dokumen Jaminan</FieldLabel>
        <Input
          id="nomorDokumen"
          value={values.nomorDokumen}
          onChange={(e) => update("nomorDokumen", e.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="atasNama">Atas Nama</FieldLabel>
        <Input
          id="atasNama"
          value={values.atasNama}
          onChange={(e) => update("atasNama", e.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="nilaiTaksiran">Nilai Taksiran</FieldLabel>
        <Input
          id="nilaiTaksiran"
          type="number"
          min="0"
          value={values.nilaiTaksiran}
          onChange={(e) => update("nilaiTaksiran", e.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="lokasiPenyimpanan">
          Nomer/ Lokasi Penyimpanan
        </FieldLabel>
        <Input
          id="lokasiPenyimpanan"
          value={values.lokasiPenyimpanan}
          onChange={(e) => update("lokasiPenyimpanan", e.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="status">Status Jaminan</FieldLabel>
        <select
          id="status"
          className="h-10 border-b border-input bg-transparent px-0 text-sm outline-none focus:border-ring"
          value={values.status}
          onChange={(e) =>
            update("status", e.target.value as FormValues["status"])
          }
        >
          <option value="TERSIMPAN">Tersimpan</option>
          <option value="DIBAWA_KELUAR">Dibawa keluar</option>
          <option value="SELESAI_PENGIKATAN">Selesai pengikatan</option>
        </select>
      </Field>
      <Field>
        <FieldLabel htmlFor="tanggalDiterima">Tanggal Diterima</FieldLabel>
        <Input
          id="tanggalDiterima"
          type="date"
          value={values.tanggalDiterima}
          onChange={(e) => update("tanggalDiterima", e.target.value)}
        />
      </Field>
      {!defaultValues && (
        <>
          <Field>
            <FieldLabel htmlFor="diserahkanKepada">Diserahkan Oleh</FieldLabel>
            <Input
              id="diserahkanKepada"
              value={values.diserahkanKepada}
              onChange={(e) => update("diserahkanKepada", e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="diterimaDari">Diterima Oleh</FieldLabel>
            <Input
              id="diterimaDari"
              value={values.diterimaDari}
              onChange={(e) => update("diterimaDari", e.target.value)}
            />
          </Field>
        </>
      )}
      <Field className="sm:col-span-2">
        <FieldLabel htmlFor="deskripsi">Deskripsi</FieldLabel>
        <Textarea
          id="deskripsi"
          value={values.deskripsi}
          onChange={(e) => update("deskripsi", e.target.value)}
        />
      </Field>
      <Field className="sm:col-span-2">
        <FieldLabel htmlFor="catatan">Catatan</FieldLabel>
        <Textarea
          id="catatan"
          value={values.catatan}
          onChange={(e) => update("catatan", e.target.value)}
        />
      </Field>
      <Field className="sm:col-span-2">
        <FieldLabel htmlFor="bukti">
          Bukti Penerimaan (JPG, PNG, WebP, PDF)
        </FieldLabel>
        <Input
          id="bukti"
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={(e) => setBukti(e.target.files?.[0])}
        />
      </Field>
      {error && <FieldError className="sm:col-span-2">{error}</FieldError>}
      <Field className="sm:col-span-2">
        <Button
          type="button"
          disabled={isPending}
          className="w-full"
          onClick={submit}
        >
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {isPending ? "Menyimpan..." : submitLabel}
        </Button>
      </Field>
    </FieldGroup>
  );
}
