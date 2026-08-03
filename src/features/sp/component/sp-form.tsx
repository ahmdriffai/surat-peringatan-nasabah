import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Nasabah } from "@/generated/prisma/client";
import { JenisSP } from "@/generated/prisma/enums";
import { useZodForm } from "@/hook/use-form";
import { Loader2 } from "lucide-react";
import { Controller } from "react-hook-form";
import { toDateInputValue } from "../label";
import { SPCreateInput, SPCreateInputSchema } from "../schema";

const JENIS_OPTIONS: { value: JenisSP; label: string }[] = [
  { value: JenisSP.PEMBERITAHUAN, label: "Surat Pemberitahuan" },
  { value: JenisSP.SP1, label: "SP 1 — Peringatan Pertama" },
  { value: JenisSP.SP2, label: "SP 2 — Peringatan Kedua" },
  { value: JenisSP.SP3, label: "SP 3 — Peringatan Terakhir" },
  { value: JenisSP.PEMBERITAHUAN_SKK, label: "Pemberitahuan SKK" },
];

const KOLEKTIBILITAS_OPTIONS = [
  { value: 1, label: "1 — Lancar" },
  { value: 2, label: "2 — Dalam Perhatian Khusus" },
  { value: 3, label: "3 — Kurang Lancar" },
  { value: 4, label: "4 — Diragukan" },
  { value: 5, label: "5 — Macet" },
];

interface NumberFieldProps {
  name: keyof Pick<
    SPCreateInput,
    | "plafond"
    | "saldo"
    | "tgkPokok"
    | "tgkBunga"
    | "tgkPokokHari"
    | "tgkBungaHari"
    | "sukuBunga"
    | "biayaAdministrasi"
  >;
  label: string;
  placeholder: string;
  control: ReturnType<typeof useZodForm<typeof SPCreateInputSchema>>["control"];
}

function NumberField({ name, label, placeholder, control }: NumberFieldProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <Input
            id={name}
            type="number"
            placeholder={placeholder}
            name={field.name}
            ref={field.ref}
            onBlur={field.onBlur}
            value={field.value ?? ""}
            onChange={(e) => field.onChange(e.target.valueAsNumber)}
          />
          {fieldState.error?.message && (
            <FieldError errors={[fieldState.error]}>
              {fieldState.error.message}
            </FieldError>
          )}
        </Field>
      )}
    />
  );
}

interface Props {
  onSubmit: (data: SPCreateInput) => void;
  isPending: boolean;
  nasabah: Nasabah[];
  defaultValues?: SPCreateInput;
  submitLabel?: string;
}

export default function SPForm({
  isPending,
  onSubmit,
  nasabah,
  defaultValues,
  submitLabel = "Simpan",
}: Props) {
  const form = useZodForm(SPCreateInputSchema, {
    defaultValues: {
      nasabahId: "",
      jenis: JenisSP.SP1,
      noPjm: "",
      jenisFasilitas: "",
      sukuBunga: 0,
      plafond: 0,
      saldo: 0,
      tgkPokok: 0,
      tgkBunga: 0,
      tgkPokokHari: 0,
      tgkBungaHari: 0,
      biayaAdministrasi: 0,
      kolektibilitas: 1,
      alasan: "",
      catatan: "",
      ...defaultValues,
    },
  });

  return (
    <FieldGroup className="gap-4 sm:grid sm:grid-cols-2">
      <Controller
        control={form.control}
        name="nasabahId"
        render={({ field, fieldState }) => (
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="nasabahId">Nasabah</FieldLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="nasabahId" className="w-full">
                <SelectValue placeholder="Pilih nasabah" />
              </SelectTrigger>
              <SelectContent>
                {nasabah.map((n) => (
                  <SelectItem key={n.id} value={n.id}>
                    {n.nama} — {n.nomorRekening}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldState.error?.message && (
              <FieldError errors={[fieldState.error]}>
                {fieldState.error.message}
              </FieldError>
            )}
          </Field>
        )}
      />
      <Controller
        control={form.control}
        name="jenis"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor="jenis">Jenis Surat</FieldLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="jenis" className="w-full">
                <SelectValue placeholder="Pilih jenis surat" />
              </SelectTrigger>
              <SelectContent>
                {JENIS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldState.error?.message && (
              <FieldError errors={[fieldState.error]}>
                {fieldState.error.message}
              </FieldError>
            )}
          </Field>
        )}
      />
      <Controller
        control={form.control}
        name="kolektibilitas"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor="kolektibilitas">Kolektibilitas</FieldLabel>
            <Select
              value={String(field.value)}
              onValueChange={(v) => field.onChange(Number(v))}
            >
              <SelectTrigger id="kolektibilitas" className="w-full">
                <SelectValue placeholder="Pilih kolektibilitas" />
              </SelectTrigger>
              <SelectContent>
                {KOLEKTIBILITAS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={String(opt.value)}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldState.error?.message && (
              <FieldError errors={[fieldState.error]}>
                {fieldState.error.message}
              </FieldError>
            )}
          </Field>
        )}
      />
      <Controller
        control={form.control}
        name="noPjm"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor="noPjm">Nomor Pinjaman</FieldLabel>
            <Input
              id="noPjm"
              type="text"
              placeholder="Nomor pinjaman"
              {...field}
            />
            {fieldState.error?.message && (
              <FieldError errors={[fieldState.error]}>
                {fieldState.error.message}
              </FieldError>
            )}
          </Field>
        )}
      />
      <Controller
        control={form.control}
        name="jenisFasilitas"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor="jenisFasilitas">Jenis Fasilitas</FieldLabel>
            <Input
              id="jenisFasilitas"
              placeholder="Kredit Umum"
              {...field}
            />
            {fieldState.error?.message && (
              <FieldError errors={[fieldState.error]}>
                {fieldState.error.message}
              </FieldError>
            )}
          </Field>
        )}
      />
      <Controller
        control={form.control}
        name="tanggalAkadKredit"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor="tanggalAkadKredit">
              Tanggal Akad Kredit
            </FieldLabel>
            <Input
              id="tanggalAkadKredit"
              type="date"
              name={field.name}
              ref={field.ref}
              onBlur={field.onBlur}
              value={toDateInputValue(field.value)}
              onChange={(e) =>
                field.onChange(e.target.value ? new Date(e.target.value) : undefined)
              }
            />
            {fieldState.error?.message && (
              <FieldError errors={[fieldState.error]}>
                {fieldState.error.message}
              </FieldError>
            )}
          </Field>
        )}
      />
      <NumberField
        control={form.control}
        name="sukuBunga"
        label="Suku Bunga (%)"
        placeholder="Suku bunga"
      />

      <NumberField
        control={form.control}
        name="plafond"
        label="Plafond"
        placeholder="Plafond pinjaman"
      />
      <NumberField
        control={form.control}
        name="saldo"
        label="Saldo"
        placeholder="Saldo pinjaman"
      />
      <NumberField
        control={form.control}
        name="tgkPokok"
        label="Tunggakan Pokok"
        placeholder="Tunggakan pokok"
      />
      <NumberField
        control={form.control}
        name="tgkBunga"
        label="Tunggakan Bunga"
        placeholder="Tunggakan bunga"
      />
      <NumberField
        control={form.control}
        name="tgkPokokHari"
        label="Tunggakan Pokok (hari)"
        placeholder="Jumlah hari tunggakan pokok"
      />
      <NumberField
        control={form.control}
        name="tgkBungaHari"
        label="Tunggakan Bunga (hari)"
        placeholder="Jumlah hari tunggakan bunga"
      />
      <NumberField
        control={form.control}
        name="biayaAdministrasi"
        label="Biaya Administrasi"
        placeholder="Biaya administrasi (opsional)"
      />

      <Controller
        control={form.control}
        name="tanggalSurat"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor="tanggalSurat">Tanggal Surat</FieldLabel>
            <Input
              id="tanggalSurat"
              type="date"
              name={field.name}
              ref={field.ref}
              onBlur={field.onBlur}
              value={toDateInputValue(field.value)}
              onChange={(e) =>
                field.onChange(e.target.value ? new Date(e.target.value) : undefined)
              }
            />
            {fieldState.error?.message && (
              <FieldError errors={[fieldState.error]}>
                {fieldState.error.message}
              </FieldError>
            )}
          </Field>
        )}
      />
      <Controller
        control={form.control}
        name="tanggalJatuhTempo"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor="tanggalJatuhTempo">
              Jatuh Tempo Pembayaran
            </FieldLabel>
            <Input
              id="tanggalJatuhTempo"
              type="date"
              name={field.name}
              ref={field.ref}
              onBlur={field.onBlur}
              value={toDateInputValue(field.value)}
              onChange={(e) =>
                field.onChange(e.target.value ? new Date(e.target.value) : undefined)
              }
            />
            {fieldState.error?.message && (
              <FieldError errors={[fieldState.error]}>
                {fieldState.error.message}
              </FieldError>
            )}
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="alasan"
        render={({ field, fieldState }) => (
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="alasan">Alasan Pemberian SP</FieldLabel>
            <Textarea
              id="alasan"
              rows={4}
              placeholder="Jelaskan alasan pemberian surat peringatan ini..."
              {...field}
            />
            {fieldState.error?.message && (
              <FieldError errors={[fieldState.error]}>
                {fieldState.error.message}
              </FieldError>
            )}
          </Field>
        )}
      />
      <Controller
        control={form.control}
        name="catatan"
        render={({ field, fieldState }) => (
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="catatan">
              Catatan{" "}
              <span className="text-muted-foreground">(opsional)</span>
            </FieldLabel>
            <Textarea
              id="catatan"
              rows={2}
              placeholder="Catatan tambahan..."
              {...field}
            />
            {fieldState.error?.message && (
              <FieldError errors={[fieldState.error]}>
                {fieldState.error.message}
              </FieldError>
            )}
          </Field>
        )}
      />

      <Field className="sm:col-span-2">
        <Button
          type="submit"
          disabled={isPending}
          className="w-full"
          onClick={form.handleSubmit(onSubmit)}
        >
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {isPending ? "Menyimpan..." : submitLabel}
        </Button>
      </Field>
    </FieldGroup>
  );
}
