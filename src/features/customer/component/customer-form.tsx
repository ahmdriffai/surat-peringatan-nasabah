import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useZodForm } from "@/hook/use-form";
import { Loader2 } from "lucide-react";
import { Controller } from "react-hook-form";
import { NasabahCreateInput, NasabahCreateInputSchema } from "../schema";

interface Props {
  onSubmit: (data: NasabahCreateInput) => void;
  isPending: boolean;
  defaultValues?: NasabahCreateInput;
  submitLabel?: string;
}

export default function CustomerForm({
  isPending,
  onSubmit,
  defaultValues,
  submitLabel = "Simpan",
}: Props) {
  const form = useZodForm(NasabahCreateInputSchema, {
    defaultValues: {
      cif: "",
      nama: "",
      nik: "",
      nomorRekening: "",
      email: "",
      telepon: "",
      alamat: "",
      ...defaultValues,
    },
  });

  return (
    <FieldGroup className="gap-4 sm:grid sm:grid-cols-2">
      <Controller
        control={form.control}
        name="cif"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor="cif">CIF</FieldLabel>
            <Input id="cif" type="text" placeholder="Nomor CIF" {...field} />
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
        name="nama"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor="nama">Nama</FieldLabel>
            <Input
              id="nama"
              type="text"
              placeholder="Nama nasabah"
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
        name="nik"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor="nik">NIK</FieldLabel>
            <Input id="nik" type="text" placeholder="Nomor NIK" {...field} />
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
        name="nomorRekening"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor="nomorRekening">Nomor Rekening</FieldLabel>
            <Input
              id="nomorRekening"
              type="text"
              placeholder="Nomor rekening"
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
        name="email"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="text"
              placeholder="example@company.com"
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
        name="telepon"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor="telepon">Telepon</FieldLabel>
            <Input
              id="telepon"
              type="text"
              placeholder="Nomor telepon"
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
        name="alamat"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor="alamat">Alamat</FieldLabel>
            <Input
              id="alamat"
              type="text"
              placeholder="Alamat nasabah"
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
