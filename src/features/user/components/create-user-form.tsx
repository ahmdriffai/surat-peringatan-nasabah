"use client";

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
import { Role } from "@/generated/prisma/enums";
import { useZodForm } from "@/hook/use-form";
import { Loader2 } from "lucide-react";
import { Controller } from "react-hook-form";
import { CreateUserInput, CreateUserInputSchema } from "../schema";

interface Props {
  onSubmit: (data: CreateUserInput) => void;
  isPending: boolean;
}

export default function CreateUserForm({ onSubmit, isPending }: Props) {
  const form = useZodForm(CreateUserInputSchema, {
    defaultValues: {
      nama: "",
      jabatan: "",
      email: "",
      password: "",
      role: Role.PETUGAS,
    },
  });

  return (
    <FieldGroup className="gap-4">
      <Controller
        control={form.control}
        name="nama"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor="nama">Nama</FieldLabel>
            <Input id="nama" {...field} />
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
          <Field>
            <FieldLabel htmlFor="jabatan">
              Jabatan{" "}
              <span className="text-muted-foreground">(opsional)</span>
            </FieldLabel>
            <Input
              id="jabatan"
              placeholder="Direktur Utama, Kepala Kredit, dll."
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
            <Input id="email" type="email" {...field} />
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
        name="password"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input id="password" type="password" {...field} />
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
        name="role"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor="role">Role</FieldLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="role" className="w-full">
                <SelectValue placeholder="Pilih role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Role.PETUGAS}>Petugas</SelectItem>
                <SelectItem value={Role.APPROVER}>Approver</SelectItem>
                <SelectItem value={Role.ADMIN}>Admin</SelectItem>
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
      <Field>
        <Button
          type="submit"
          disabled={isPending}
          className="w-full"
          onClick={form.handleSubmit(onSubmit)}
        >
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {isPending ? "Menyimpan..." : "Tambah User"}
        </Button>
      </Field>
    </FieldGroup>
  );
}
