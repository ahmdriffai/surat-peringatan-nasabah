import { createJaminan } from "@/services/jaminan/create";
import { createMutasiJaminan } from "@/services/jaminan/create-mutasi";
import { deleteJaminan } from "@/services/jaminan/delete";
import { deleteMutasiJaminan } from "@/services/jaminan/delete-mutasi";
import { editJaminan } from "@/services/jaminan/edit";
import { getAllJaminan } from "@/services/jaminan/get-all";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  JaminanCreateInput,
  JaminanEditInput,
  MutasiJaminanInput,
} from "./schema";

const QUERY_KEY = ["jaminan-pinjaman"];

function showError(error: Error) {
  toast.error(error.message, { position: "top-center", richColors: true });
}

export function useGetAllJaminan() {
  return useQuery({ queryKey: QUERY_KEY, queryFn: getAllJaminan });
}

export function useCreateJaminan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, bukti }: { data: JaminanCreateInput; bukti?: File }) =>
      createJaminan(data, bukti),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Jaminan berhasil ditambahkan", { position: "top-center", richColors: true });
    },
    onError: showError,
  });
}

export function useEditJaminan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: JaminanEditInput }) =>
      editJaminan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Jaminan berhasil diperbarui", { position: "top-center", richColors: true });
    },
    onError: showError,
  });
}

export function useDeleteJaminan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteJaminan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Jaminan berhasil dihapus", { position: "top-center", richColors: true });
    },
    onError: showError,
  });
}

export function useCreateMutasiJaminan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      jaminanId,
      data,
      bukti,
    }: {
      jaminanId: string;
      data: MutasiJaminanInput;
      bukti?: File;
    }) => createMutasiJaminan(jaminanId, data, bukti),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Mutasi jaminan berhasil dicatat", { position: "top-center", richColors: true });
    },
    onError: showError,
  });
}

export function useDeleteMutasiJaminan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMutasiJaminan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Riwayat mutasi berhasil dihapus", { position: "top-center", richColors: true });
    },
    onError: showError,
  });
}
