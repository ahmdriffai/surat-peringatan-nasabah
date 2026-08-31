import {
  EnrichedLoanData,
  SearchLoanParams,
  searchExternalLoans,
} from "@/services/external/loans";
import { approveSP } from "@/services/sp/approve";
import { createSP } from "@/services/sp/create";
import { deleteSP } from "@/services/sp/delete";
import { getDetailSP } from "@/services/sp/detail";
import { getAllSP } from "@/services/sp/get-all";
import { rejectSP } from "@/services/sp/reject";
import { revisiSP } from "@/services/sp/revisi";
import { setArsipSP } from "@/services/sp/set-arsip";
import { setKejaksaanSP } from "@/services/sp/set-kejaksaan";
import { submitForApproval } from "@/services/sp/submit-for-approval";
import { tandaiSelesai } from "@/services/sp/tandai-selesai";
import { tandaiTerkirim } from "@/services/sp/tandai-terkirim";
import { updateSP } from "@/services/sp/update";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ApproveSPInput,
  RejectSPInput,
  SPCreateInput,
  SPWithNasabah,
  TandaiTerkirimInput,
} from "./schema";

export const useGetAllSP = () => {
  return useQuery<SPWithNasabah[]>({
    queryKey: ["sp"],
    queryFn: async () => await getAllSP(),
  });
};

export const useGetDetailSP = (id: string) => {
  return useQuery<SPWithNasabah | null>({
    queryKey: ["sp", id],
    queryFn: async () => await getDetailSP(id),
    enabled: !!id,
  });
};

export const useCreateSP = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SPCreateInput) => await createSP(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sp"] });
      toast.success("Surat peringatan berhasil ditambahkan", {
        position: "top-center",
        richColors: true,
      });
    },
    onError: (error) => {
      toast.error(error.message, { position: "top-center", richColors: true });
    },
  });
};

export const useUpdateSP = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: SPCreateInput }) =>
      await updateSP(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sp"] });
      toast.success("Surat peringatan berhasil diperbarui", {
        position: "top-center",
        richColors: true,
      });
    },
    onError: (error) => {
      toast.error(error.message, { position: "top-center", richColors: true });
    },
  });
};

function useSPMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
  successMessage: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sp"] });
      toast.success(successMessage, {
        position: "top-center",
        richColors: true,
      });
    },
    onError: (error) => {
      toast.error(error.message, { position: "top-center", richColors: true });
    },
  });
}

export const useSubmitForApproval = () =>
  useSPMutation(
    async (id: string) => await submitForApproval(id),
    "Surat peringatan diajukan untuk approval",
  );

export const useApproveSP = () =>
  useSPMutation(
    async ({ id, data }: { id: string; data: ApproveSPInput }) =>
      await approveSP(id, data),
    "Surat peringatan disetujui",
  );

export const useRejectSP = () =>
  useSPMutation(
    async ({ id, data }: { id: string; data: RejectSPInput }) =>
      await rejectSP(id, data),
    "Surat peringatan ditolak",
  );

export const useRevisiSP = () =>
  useSPMutation(
    async (id: string) => await revisiSP(id),
    "Surat peringatan dikembalikan ke draft",
  );

export const useTandaiTerkirim = () =>
  useSPMutation(
    async ({
      id,
      data,
      buktiKirim,
    }: {
      id: string;
      data: TandaiTerkirimInput;
      buktiKirim?: File;
    }) => await tandaiTerkirim(id, data, buktiKirim),
    "Surat peringatan ditandai terkirim",
  );

export const useTandaiSelesai = () =>
  useSPMutation(
    async ({ id, buktiTandaTerima }: { id: string; buktiTandaTerima?: File }) =>
      await tandaiSelesai(id, buktiTandaTerima),
    "Surat peringatan ditandai selesai",
  );

export const useDeleteSP = () =>
  useSPMutation(async (id: string) => await deleteSP(id), "Surat peringatan dihapus");

export const useSetKejaksaanSP = () =>
  useSPMutation(
    async ({ id, kejaksaanId }: { id: string; kejaksaanId: string }) =>
      await setKejaksaanSP(id, kejaksaanId),
    "Kepala Kejaksaan Negeri surat berhasil ditetapkan",
  );

export const useSetArsipSP = () =>
  useSPMutation(
    async ({ id, file }: { id: string; file: File }) =>
      await setArsipSP(id, file),
    "Arsip surat berhasil diunggah",
  );

export const useSearchExternalLoans = () => {
  return useMutation<EnrichedLoanData[], Error, SearchLoanParams>({
    mutationFn: async (params: SearchLoanParams) => {
      return await searchExternalLoans(params);
    },
    onError: (error) => {
      toast.error(error.message || "Gagal mencari data pinjaman", {
        position: "top-center",
        richColors: true,
      });
    },
  });
};
