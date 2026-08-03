"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import Table from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { User } from "@/generated/prisma/client";
import { Role } from "@/generated/prisma/enums";
import { useZodForm } from "@/hook/use-form";
import { Loader2, Pen, Power, Trash2, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { Controller } from "react-hook-form";
import { useEditUser } from "../hook";
import { EditUserInput, EditUserInputSchema } from "../schema";

interface Props {
  users: User[];
  onDelete: (userId: string) => void;
  isDeletePending: boolean;
  onNonAktif: (userId: string) => void;
  isNonAktifPending: boolean;
}

const ROLE_VARIANT: Record<
  Role,
  "default" | "secondary" | "destructive" | "outline"
> = {
  ADMIN: "destructive",
  APPROVER: "default",
  PETUGAS: "secondary",
};

export default function UserList({
  users,
  onDelete,
  onNonAktif,
  isDeletePending,
  isNonAktifPending,
}: Props) {
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const { mutate: mutateEdit, isPending: isEditPending } = useEditUser();

  const handleEditSubmit = (data: EditUserInput) => {
    if (!editTarget) return;

    mutateEdit(
      { id: editTarget.id, data },
      { onSuccess: () => setEditTarget(null) },
    );
  };

  return (
    <>
      <Table<User>
        data={users}
        keyExtractor={(row) => row.id}
        emptyMessage="Tidak ada data user"
        columns={[
          {
            header: "No",
            accessor: () => <p>#</p>,
          },
          {
            header: "Nama",
            accessor: "nama",
          },
          {
            header: "Jabatan",
            accessor: (row) => row.jabatan ?? "-",
          },
          {
            header: "Email",
            accessor: "email",
          },
          {
            header: "Role",
            accessor: (row) => (
              <Badge variant={ROLE_VARIANT[row.role]}>
                {row.role.toLowerCase()}
              </Badge>
            ),
          },
          {
            header: "Action",
            accessor: (row) => (
              <div className="flex gap-2 justify-start">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      disabled={isNonAktifPending}
                      variant="secondary"
                      size="sm"
                      onClick={() => onNonAktif(row.id)}
                    >
                      {isNonAktifPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <>
                          <Power />
                          {row.aktif ? "Nonaktikan" : "Aktifkan"}
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{row.aktif ? "Nonaktikan" : "Aktifkan"} user</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setEditTarget(row)}
                    >
                      <Pen />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit user</p>
                  </TooltipContent>
                </Tooltip>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                      <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                        <Trash2Icon />
                      </AlertDialogMedia>
                      <AlertDialogTitle>Hapus user?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tindakan ini akan menghapus user {row.nama} secara
                        permanen.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel variant="outline">
                        Batal
                      </AlertDialogCancel>
                      <AlertDialogAction
                        disabled={isDeletePending}
                        onClick={() => onDelete(row.id)}
                        variant="destructive"
                      >
                        {isDeletePending && (
                          <Loader2 className="size-4 animate-spin" />
                        )}
                        {isDeletePending ? "Memproses..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ),
          },
        ]}
      />

      <Dialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
            <DialogDescription>
              Perbarui role dan status user berikut.
            </DialogDescription>
          </DialogHeader>
          {editTarget && (
            <EditUserForm
              key={editTarget.id}
              user={editTarget}
              onSubmit={handleEditSubmit}
              isPending={isEditPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function EditUserForm({
  user,
  onSubmit,
  isPending,
}: {
  user: User;
  onSubmit: (data: EditUserInput) => void;
  isPending: boolean;
}) {
  const form = useZodForm(EditUserInputSchema, {
    defaultValues: {
      nama: user.nama,
      jabatan: user.jabatan ?? "",
      email: user.email,
      role: user.role,
      aktif: user.aktif,
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
      <Controller
        control={form.control}
        name="aktif"
        render={({ field }) => (
          <Field orientation="horizontal">
            <Checkbox
              id="aktif"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
            <FieldLabel htmlFor="aktif">Aktif</FieldLabel>
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
          {isPending ? "Menyimpan..." : "Simpan perubahan"}
        </Button>
      </Field>
    </FieldGroup>
  );
}
