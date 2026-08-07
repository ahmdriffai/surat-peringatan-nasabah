"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useZodForm } from "@/hook/use-form";
import { User } from "@/generated/prisma/client";
import { KeyRound, Loader2, User as UserIcon } from "lucide-react";
import { Controller } from "react-hook-form";
import {
  useChangePassword,
  useUpdateProfile,
} from "../hook";
import {
  ChangePasswordInput,
  ChangePasswordInputSchema,
  UpdateProfileInput,
  UpdateProfileInputSchema,
} from "../schema";

interface Props {
  user: User;
}

export default function AccountSettings({ user }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <ProfileForm user={user} />
      <PasswordForm />
    </div>
  );
}

function ProfileForm({ user }: Props) {
  const { mutate, isPending } = useUpdateProfile();
  const form = useZodForm(UpdateProfileInputSchema, {
    defaultValues: { nama: user.nama, jabatan: user.jabatan ?? "" },
  });

  const onSubmit = (data: UpdateProfileInput) => {
    mutate(data);
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2">
        <UserIcon className="size-4 text-muted-foreground" />
        <CardTitle className="text-base">Profil</CardTitle>
      </CardHeader>
      <CardContent>
        <FieldGroup className="gap-4">
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" value={user.email} disabled />
            <FieldDescription>
              Email tidak bisa diubah sendiri, hubungi admin.
            </FieldDescription>
          </Field>
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
                <FieldLabel htmlFor="jabatan">Jabatan</FieldLabel>
                <Input id="jabatan" {...field} />
                {fieldState.error?.message && (
                  <FieldError errors={[fieldState.error]}>
                    {fieldState.error.message}
                  </FieldError>
                )}
              </Field>
            )}
          />
          <Field>
            <Button disabled={isPending} onClick={form.handleSubmit(onSubmit)}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {isPending ? "Menyimpan..." : "Simpan Profil"}
            </Button>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}

function PasswordForm() {
  const { mutate, isPending } = useChangePassword();
  const form = useZodForm(ChangePasswordInputSchema, {
    defaultValues: {
      passwordLama: "",
      passwordBaru: "",
      konfirmasiPassword: "",
    },
  });

  const onSubmit = (data: ChangePasswordInput) => {
    mutate(data, { onSuccess: () => form.reset() });
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2">
        <KeyRound className="size-4 text-muted-foreground" />
        <CardTitle className="text-base">Ubah Password</CardTitle>
      </CardHeader>
      <CardContent>
        <FieldGroup className="gap-4">
          <Controller
            control={form.control}
            name="passwordLama"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="passwordLama">Password Lama</FieldLabel>
                <Input id="passwordLama" type="password" {...field} />
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
            name="passwordBaru"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="passwordBaru">Password Baru</FieldLabel>
                <Input id="passwordBaru" type="password" {...field} />
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
            name="konfirmasiPassword"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="konfirmasiPassword">
                  Konfirmasi Password Baru
                </FieldLabel>
                <Input id="konfirmasiPassword" type="password" {...field} />
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
              variant="outline"
              disabled={isPending}
              onClick={form.handleSubmit(onSubmit)}
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {isPending ? "Menyimpan..." : "Ubah Password"}
            </Button>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
