"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Nasabah } from "@/generated/prisma/client";
import LoanSearch from "@/features/sp/component/loan-search";
import { EnrichedLoanData } from "@/services/external/loans";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { ZodError } from "zod";
import {
  JaminanCreateInput,
  JaminanCreateInputSchema,
} from "../schema";

type FormValues = {
  nasabahId: string;
  noPjm: string;
  jenis: string;
  nomorDokumen: string;
  deskripsi: string;
  atasNama: string;
  nilaiTaksiran: string;
  lokasiPenyimpanan: string;
  tanggalDiterima: string;
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
  nasabah: Nasabah[];
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
  tanggalDiterima: new Date().toISOString().slice(0, 10),
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
  const [selectedLoan, setSelectedLoan] = useState<EnrichedLoanData | null>(null);

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
          ? submissionError.issues[0]?.message ?? "Periksa kembali data jaminan."
          : submissionError instanceof Error
          ? submissionError.message
          : "Periksa kembali data jaminan.",
      );
    }
  };

  return (
    <FieldGroup className="gap-4 sm:grid sm:grid-cols-2">
      {!defaultValues && <LoanSearch
        selectedLoan={selectedLoan}
        onSelectLoan={handleSelectLoan}
        onClearSelection={() => {
          setSelectedLoan(null);
          setValues((current) => ({ ...current, nasabahId: "", nasabahData: undefined, noPjm: "" }));
        }}
      />}
      {defaultValues && <Field>
        <FieldLabel htmlFor="nasabahId">Nasabah</FieldLabel>
        <select
          id="nasabahId"
          className="h-10 border-b border-input bg-transparent px-0 text-sm outline-none focus:border-ring"
          value={values.nasabahId}
          onChange={(event) => update("nasabahId", event.target.value)}
        >
          <option value="">Pilih nasabah</option>
          {nasabah.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nama} — {item.cif}
            </option>
          ))}
        </select>
      </Field>}
      <Field>
        <FieldLabel htmlFor="noPjm">Nomor Pinjaman</FieldLabel>
        <Input id="noPjm" value={values.noPjm} onChange={(e) => update("noPjm", e.target.value)} />
      </Field>
      <Field>
        <FieldLabel htmlFor="jenis">Jenis Jaminan *</FieldLabel>
        <Input id="jenis" placeholder="BPKB / SHM / lainnya" value={values.jenis} onChange={(e) => update("jenis", e.target.value)} />
      </Field>
      <Field>
        <FieldLabel htmlFor="nomorDokumen">Nomor Dokumen</FieldLabel>
        <Input id="nomorDokumen" value={values.nomorDokumen} onChange={(e) => update("nomorDokumen", e.target.value)} />
      </Field>
      <Field>
        <FieldLabel htmlFor="atasNama">Atas Nama</FieldLabel>
        <Input id="atasNama" value={values.atasNama} onChange={(e) => update("atasNama", e.target.value)} />
      </Field>
      <Field>
        <FieldLabel htmlFor="nilaiTaksiran">Nilai Taksiran</FieldLabel>
        <Input id="nilaiTaksiran" type="number" min="0" value={values.nilaiTaksiran} onChange={(e) => update("nilaiTaksiran", e.target.value)} />
      </Field>
      <Field>
        <FieldLabel htmlFor="lokasiPenyimpanan">Lokasi Penyimpanan</FieldLabel>
        <Input id="lokasiPenyimpanan" value={values.lokasiPenyimpanan} onChange={(e) => update("lokasiPenyimpanan", e.target.value)} />
      </Field>
      <Field>
        <FieldLabel htmlFor="tanggalDiterima">Tanggal Diterima</FieldLabel>
        <Input id="tanggalDiterima" type="date" value={values.tanggalDiterima} onChange={(e) => update("tanggalDiterima", e.target.value)} />
      </Field>
      <Field className="sm:col-span-2">
        <FieldLabel htmlFor="deskripsi">Deskripsi</FieldLabel>
        <Textarea id="deskripsi" value={values.deskripsi} onChange={(e) => update("deskripsi", e.target.value)} />
      </Field>
      <Field className="sm:col-span-2">
        <FieldLabel htmlFor="catatan">Catatan</FieldLabel>
        <Textarea id="catatan" value={values.catatan} onChange={(e) => update("catatan", e.target.value)} />
      </Field>
      <Field className="sm:col-span-2">
        <FieldLabel htmlFor="bukti">Bukti Penerimaan (JPG, PNG, WebP, PDF)</FieldLabel>
        <Input id="bukti" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(e) => setBukti(e.target.files?.[0])} />
      </Field>
      {error && <FieldError className="sm:col-span-2">{error}</FieldError>}
      <Field className="sm:col-span-2">
        <Button type="button" disabled={isPending} className="w-full" onClick={submit}>
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {isPending ? "Menyimpan..." : submitLabel}
        </Button>
      </Field>
    </FieldGroup>
  );
}
