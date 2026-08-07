import { User } from "@/generated/prisma/client";
import { changeOwnPassword } from "@/services/users/change-password";
import { createUser } from "@/services/users/create";
import { deleteUser } from "@/services/users/delete";
import { editUser } from "@/services/users/edit";
import { getAllUsers } from "@/services/users/get-all";
import { getOwnProfile } from "@/services/users/get-own-profile";
import { updateOwnProfile } from "@/services/users/update-profile";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  ChangePasswordInput,
  CreateUserInput,
  EditUserInput,
  UpdateProfileInput,
} from "./schema";

export const useGetAllUsers = () => {
  return useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => await getAllUsers(),
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserInput) => await createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User berhasil ditambahkan", {
        position: "top-center",
        richColors: true,
      });
    },
    onError: (error) => {
      toast.error(error.message, { position: "top-center", richColors: true });
    },
  });
};

export const useGetOwnProfile = () => {
  return useQuery<User>({
    queryKey: ["users", "me"],
    queryFn: async () => await getOwnProfile(),
  });
};

export const useEditUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: EditUserInput }) =>
      await editUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User berhasil diperbarui", {
        position: "top-center",
        richColors: true,
      });
    },
    onError: (error) => {
      toast.error(error.message, { position: "top-center", richColors: true });
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { update } = useSession();

  return useMutation({
    mutationFn: async (data: UpdateProfileInput) =>
      await updateOwnProfile(data),
    onSuccess: async (user) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      await update({ nama: user.nama });
      toast.success("Profil berhasil diperbarui", {
        position: "top-center",
        richColors: true,
      });
    },
    onError: (error) => {
      toast.error(error.message, { position: "top-center", richColors: true });
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (data: ChangePasswordInput) =>
      await changeOwnPassword(data),
    onSuccess: () => {
      toast.success("Password berhasil diubah", {
        position: "top-center",
        richColors: true,
      });
    },
    onError: (error) => {
      toast.error(error.message, { position: "top-center", richColors: true });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => await deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User berhasil dihapus", {
        position: "top-center",
        richColors: true,
      });
    },
    onError: (error) => {
      toast.error(error.message, { position: "top-center", richColors: true });
    },
  });
};
