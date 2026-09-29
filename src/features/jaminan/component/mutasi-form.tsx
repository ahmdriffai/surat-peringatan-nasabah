"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { ZodError } from "zod";
import { MutasiJaminanInput, MutasiJaminanInputSchema } from "../schema";

type FormValues = {
  arah: "MASUK" | "KELUAR";
  terjadiPada: string;
  diserahkanKepada: string;
  diterimaDari: string;
  keperluan: string;
  lokasi: string;
  tanggalKembaliRencana: string;
  tanggalKembali: string;
  catatan: string;
};

interface Props {
  onSubmit: (data: MutasiJaminanInput, bukti?: File) => void;
  isPending: boolean;
}

const initialValues: FormValues = {
  arah: "KELUAR",
  terjadiPada: new Date().toISOString().slice(0, 16),
  diserahkanKepada: "",
  diterimaDari: "",
  keperluan: "",
  lokasi: "",
  tanggalKembaliRencana: "",
  tanggalKembali: "",
  catatan: "",
};

export default function MutasiForm({ onSubmit, isPending }: Props) {
  const [values, setValues] = useState(initialValues);
  const [bukti, setBukti] = useState<File>();
  const [error, setError] = useState("");

  const update = (key: keyof FormValues, value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  const submit = () => {
    try {
      setError("");
      onSubmit(MutasiJaminanInputSchema.parse(values), bukti);
      setValues({ ...initialValues, terjadiPada: new Date().toISOString().slice(0, 16) });
      setBukti(undefined);
    } catch (submissionError) {
      setError(
        submissionError instanceof ZodError
          ? submissionError.issues[0]?.message ?? "Periksa kembali data mutasi."
          : submissionError instanceof Error
          ? submissionError.message
          : "Periksa kembali data mutasi.",
      );
    }
  };

  return (
    <FieldGroup className="gap-4 sm:grid sm:grid-cols-2">
      <Field>
        <FieldLabel htmlFor="arah">Jenis Mutasi</FieldLabel>
        <select
          id="arah"
          className="h-10 border-b border-input bg-transparent px-0 text-sm outline-none focus:border-ring"
          value={values.arah}
          onChange={(event) => update("arah", event.target.value)}
        >
          <option value="KELUAR">Keluar</option>
          <option value="MASUK">Masuk / Kembali</option>
        </select>
      </Field>
      <Field>
        <FieldLabel htmlFor="terjadiPada">Tanggal dan Waktu</FieldLabel>
        <Input id="terjadiPada" type="datetime-local" value={values.terjadiPada} onChange={(e) => update("terjadiPada", e.target.value)} />
      </Field>
      <Field>
        <FieldLabel htmlFor="diserahkanKepada">Diserahkan Kepada</FieldLabel>
        <Input id="diserahkanKepada" value={values.diserahkanKepada} onChange={(e) => update("diserahkanKepada", e.target.value)} />
      </Field>
      <Field>
        <FieldLabel htmlFor="diterimaDari">Diterima Dari</FieldLabel>
        <Input id="diterimaDari" value={values.diterimaDari} onChange={(e) => update("diterimaDari", e.target.value)} />
      </Field>
      <Field>
        <FieldLabel htmlFor="keperluan">Keperluan</FieldLabel>
        <Input id="keperluan" value={values.keperluan} onChange={(e) => update("keperluan", e.target.value)} />
      </Field>
      <Field>
        <FieldLabel htmlFor="lokasi">Lokasi</FieldLabel>
        <Input id="lokasi" value={values.lokasi} onChange={(e) => update("lokasi", e.target.value)} />
      </Field>
      <Field>
        <FieldLabel htmlFor="tanggalKembaliRencana">Rencana Kembali</FieldLabel>
        <Input id="tanggalKembaliRencana" type="date" value={values.tanggalKembaliRencana} onChange={(e) => update("tanggalKembaliRencana", e.target.value)} />
      </Field>
      <Field>
        <FieldLabel htmlFor="tanggalKembali">Realisasi Kembali</FieldLabel>
        <Input id="tanggalKembali" type="date" value={values.tanggalKembali} onChange={(e) => update("tanggalKembali", e.target.value)} />
      </Field>
      <Field className="sm:col-span-2">
        <FieldLabel htmlFor="catatanMutasi">Catatan</FieldLabel>
        <Textarea id="catatanMutasi" value={values.catatan} onChange={(e) => update("catatan", e.target.value)} />
      </Field>
      <Field className="sm:col-span-2">
        <FieldLabel htmlFor="buktiMutasi">Bukti Mutasi (JPG, PNG, WebP, PDF)</FieldLabel>
        <Input id="buktiMutasi" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(e) => setBukti(e.target.files?.[0])} />
      </Field>
      {error && <FieldError className="sm:col-span-2">{error}</FieldError>}
      <Field className="sm:col-span-2">
        <Button type="button" disabled={isPending} className="w-full" onClick={submit}>
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {isPending ? "Menyimpan..." : "Catat Mutasi"}
        </Button>
      </Field>
    </FieldGroup>
  );
}
