import { User } from "@/generated/prisma/client";
import { deleteUser } from "@/services/users/delete";
import { editUser } from "@/services/users/edit";
import { getAllUsers } from "@/services/users/get-all";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { EditUserInput } from "./schema";

export const useGetAllUsers = () => {
  return useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => await getAllUsers(),
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
