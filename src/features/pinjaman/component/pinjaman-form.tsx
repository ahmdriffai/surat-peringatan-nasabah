"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { PinjamanCreateInput, PinjamanCreateInputSchema } from "../schema";

interface Props {
  onSubmit: (data: PinjamanCreateInput) => void;
  isPending: boolean;
}

const numberFields = [
  ["sukuBunga", "Suku Bunga (%)"],
  ["plafond", "Plafond"],
  ["saldo", "Saldo"],
  ["tgkPokok", "Tunggakan Pokok"],
  ["tgkBunga", "Tunggakan Bunga"],
  ["tgkPokokHari", "Tunggakan Pokok (hari)"],
  ["tgkBungaHari", "Tunggakan Bunga (hari)"],
] as const;
const numericNames: ReadonlySet<string> = new Set(numberFields.map(([name]) => name));

export default function PinjamanForm({ onSubmit, isPending }: Props) {
  const [values, setValues] = useState<Record<string, string>>({
    noPjm: "",
    jenisFasilitas: "",
    tanggalAkadKredit: "",
  });
  const [error, setError] = useState("");
  const update = (name: string, value: string) =>
    setValues((current) => ({ ...current, [name]: value }));

  const submit = () => {
    const parsed = PinjamanCreateInputSchema.safeParse(
      Object.fromEntries(
        Object.entries(values).map(([key, value]) => [
          key,
          value === "" ? undefined : numericNames.has(key) ? Number(value) : value,
        ]),
      ),
    );
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Periksa kembali data pinjaman.");
      return;
    }
    setError("");
    onSubmit(parsed.data);
  };

  return (
    <FieldGroup className="gap-4 sm:grid sm:grid-cols-2">
      <Field>
        <FieldLabel htmlFor="noPjm">Nomor Pinjaman *</FieldLabel>
        <Input id="noPjm" value={values.noPjm ?? ""} onChange={(e) => update("noPjm", e.target.value)} />
      </Field>
      <Field>
        <FieldLabel htmlFor="jenisFasilitas">Jenis Fasilitas</FieldLabel>
        <Input id="jenisFasilitas" value={values.jenisFasilitas ?? ""} onChange={(e) => update("jenisFasilitas", e.target.value)} />
      </Field>
      <Field>
        <FieldLabel htmlFor="tanggalAkadKredit">Tanggal Akad Kredit</FieldLabel>
        <Input id="tanggalAkadKredit" type="date" value={values.tanggalAkadKredit ?? ""} onChange={(e) => update("tanggalAkadKredit", e.target.value)} />
      </Field>
      {numberFields.map(([name, label]) => (
        <Field key={name}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <Input id={name} type="number" min="0" value={values[name] ?? ""} onChange={(e) => update(name, e.target.value)} />
        </Field>
      ))}
      {error && <FieldError className="sm:col-span-2">{error}</FieldError>}
      <Field className="sm:col-span-2">
        <Button type="button" disabled={isPending} className="w-full" onClick={submit}>
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {isPending ? "Menyimpan..." : "Simpan Pinjaman"}
        </Button>
      </Field>
    </FieldGroup>
  );
}
