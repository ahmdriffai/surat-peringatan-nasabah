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
import {
  KepalaKejaksaanInput,
  KepalaKejaksaanInputSchema,
} from "../schema";

interface Props {
  onSubmit: (data: KepalaKejaksaanInput) => void;
  isPending: boolean;
  defaultValues?: KepalaKejaksaanInput;
  submitLabel?: string;
}

export default function KejaksaanForm({
  isPending,
  onSubmit,
  defaultValues,
  submitLabel = "Simpan",
}: Props) {
  const form = useZodForm(KepalaKejaksaanInputSchema, {
    defaultValues: {
      nama: "",
      jabatan: "",
      pangkat: "",
      nip: "",
      alamat: "",
      ...defaultValues,
    },
  });

  return (
    <FieldGroup className="gap-4 sm:grid sm:grid-cols-2">
      <Controller
        control={form.control}
        name="nama"
        render={({ field, fieldState }) => (
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="nama">Nama</FieldLabel>
            <Input
              id="nama"
              placeholder="Nama lengkap beserta gelar"
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
        name="jabatan"
        render={({ field, fieldState }) => (
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="jabatan">Jabatan</FieldLabel>
            <Input
              id="jabatan"
              placeholder="Kepala Kejaksaan Negeri Wonosobo"
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
        name="pangkat"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor="pangkat">
              Pangkat <span className="text-muted-foreground">(opsional)</span>
            </FieldLabel>
            <Input id="pangkat" placeholder="Jaksa Madya" {...field} />
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
        name="nip"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor="nip">
              NIP <span className="text-muted-foreground">(opsional)</span>
            </FieldLabel>
            <Input id="nip" placeholder="Nomor Induk Pegawai" {...field} />
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
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="alamat">
              Alamat Kantor{" "}
              <span className="text-muted-foreground">(opsional)</span>
            </FieldLabel>
            <Input id="alamat" placeholder="Alamat kantor kejaksaan" {...field} />
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
