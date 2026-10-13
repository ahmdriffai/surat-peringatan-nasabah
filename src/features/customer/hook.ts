import { createNasabah } from "@/services/nasabah/create";
import { deleteNasabah } from "@/services/nasabah/delete";
import { editNasabah } from "@/services/nasabah/edit";
import { getAllNasabah, NasabahWithPinjaman } from "@/services/nasabah/get-all";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { NasabahCreateInput, NasabahEditInput } from "./schema";

export const useGetAllNasabah = () => {
  return useQuery<NasabahWithPinjaman[]>({
    queryKey: ["nasabah"],
    queryFn: async () => await getAllNasabah(),
  });
};

export const useCreateNasabah = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: NasabahCreateInput) => await createNasabah(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nasabah"] });
      toast.success("Nasabah berhasil ditambahkan", {
        position: "top-center",
        richColors: true,
      });
    },
    onError: (error) => {
      toast.error(error.message, { position: "top-center", richColors: true });
    },
  });
};

export const useEditNasabah = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: NasabahEditInput;
    }) => await editNasabah(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nasabah"] });
      toast.success("Nasabah berhasil diperbarui", {
        position: "top-center",
        richColors: true,
      });
    },
    onError: (error) => {
      toast.error(error.message, { position: "top-center", richColors: true });
    },
  });
};

export const useDeleteNasabah = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => await deleteNasabah(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nasabah"] });
      toast.success("Nasabah berhasil dihapus", {
        position: "top-center",
        richColors: true,
      });
    },
    onError: (error) => {
      toast.error(error.message, { position: "top-center", richColors: true });
    },
  });
};
