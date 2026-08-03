import { createKepalaKejaksaan } from "@/services/kejaksaan/create";
import { deleteKepalaKejaksaan } from "@/services/kejaksaan/delete";
import { editKepalaKejaksaan } from "@/services/kejaksaan/edit";
import { getAllKepalaKejaksaan } from "@/services/kejaksaan/get-all";
import { KepalaKejaksaan } from "@/generated/prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { KepalaKejaksaanInput } from "./schema";

export const useGetAllKepalaKejaksaan = () => {
  return useQuery<KepalaKejaksaan[]>({
    queryKey: ["kejaksaan"],
    queryFn: async () => await getAllKepalaKejaksaan(),
  });
};

export const useCreateKepalaKejaksaan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: KepalaKejaksaanInput) =>
      await createKepalaKejaksaan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kejaksaan"] });
      toast.success("Kepala Kejaksaan Negeri berhasil ditambahkan", {
        position: "top-center",
        richColors: true,
      });
    },
    onError: (error) => {
      toast.error(error.message, { position: "top-center", richColors: true });
    },
  });
};

export const useEditKepalaKejaksaan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: KepalaKejaksaanInput;
    }) => await editKepalaKejaksaan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kejaksaan"] });
      toast.success("Kepala Kejaksaan Negeri berhasil diperbarui", {
        position: "top-center",
        richColors: true,
      });
    },
    onError: (error) => {
      toast.error(error.message, { position: "top-center", richColors: true });
    },
  });
};

export const useDeleteKepalaKejaksaan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => await deleteKepalaKejaksaan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kejaksaan"] });
      toast.success("Kepala Kejaksaan Negeri berhasil dihapus", {
        position: "top-center",
        richColors: true,
      });
    },
    onError: (error) => {
      toast.error(error.message, { position: "top-center", richColors: true });
    },
  });
};
