"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CreateUserForm from "@/features/user/components/create-user-form";
import UserList from "@/features/user/components/user-list";
import {
  useCreateUser,
  useDeleteUser,
  useEditUser,
  useGetAllUsers,
} from "@/features/user/hook";
import { CreateUserInput } from "@/features/user/schema";
import { useState } from "react";

export default function PageUser() {
  const [open, setOpen] = useState<boolean>(false);

  const { mutate: mutateCreate, isPending: pendingCreate } = useCreateUser();
  const { mutate: mutateDelete, isPending: pendingDelete } = useDeleteUser();
  const { mutate: mutateNonAktif, isPending: pendingNonAktif } = useEditUser();
  const { data } = useGetAllUsers();

  const handleCreateSubmit = (data: CreateUserInput) => {
    mutateCreate(data, { onSuccess: () => setOpen(false) });
  };

  const handleDelete = (id: string) => {
    mutateDelete(id);
  };

  const handleNonAktif = (id: string) => {
    const user = data?.find((u) => u.id === id);
    mutateNonAktif({
      id,
      data: {
        aktif: !(user?.aktif ?? false),
      },
    });
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Tambah User</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah User</DialogTitle>
              <DialogDescription>
                Buat akun baru untuk petugas, approver, atau admin.
              </DialogDescription>
            </DialogHeader>
            <CreateUserForm
              onSubmit={handleCreateSubmit}
              isPending={pendingCreate}
            />
          </DialogContent>
        </Dialog>
      </div>

      <UserList
        users={data ?? []}
        onDelete={handleDelete}
        isDeletePending={pendingDelete}
        isNonAktifPending={pendingNonAktif}
        onNonAktif={handleNonAktif}
      />
    </div>
  );
}
