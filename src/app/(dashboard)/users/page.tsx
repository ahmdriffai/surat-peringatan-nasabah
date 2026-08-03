"use client";
import UserList from "@/features/user/components/user-list";
import {
  useDeleteUser,
  useEditUser,
  useGetAllUsers,
} from "@/features/user/hook";

export default function PageUser() {
  const { mutate: mutateDelete, isPending: pendingDelete } = useDeleteUser();
  const { mutate: mutateNonAktif, isPending: pendingNonAktif } = useEditUser();
  const { data } = useGetAllUsers();

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
    <div className="w-full">
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
