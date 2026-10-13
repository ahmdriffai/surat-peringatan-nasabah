import { createPinjaman } from "@/services/pinjaman/create";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PinjamanCreateInput } from "./schema";

export function useCreatePinjaman() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ nasabahId, data }: { nasabahId: string; data: PinjamanCreateInput }) =>
      createPinjaman(nasabahId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nasabah"] });
      toast.success("Pinjaman berhasil ditambahkan", { position: "top-center", richColors: true });
    },
    onError: (error) => {
      toast.error(error.message, { position: "top-center", richColors: true });
    },
  });
}
