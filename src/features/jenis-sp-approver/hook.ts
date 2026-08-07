import { getAllJenisSPApprovers } from "@/services/jenis-sp-approver/get-all";
import { setJenisSPApprovers } from "@/services/jenis-sp-approver/set";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SetJenisSPApproverInput } from "./schema";

export const useGetJenisSPApprovers = () => {
  return useQuery({
    queryKey: ["jenis-sp-approvers"],
    queryFn: async () => await getAllJenisSPApprovers(),
  });
};

export const useSetJenisSPApprovers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SetJenisSPApproverInput) =>
      await setJenisSPApprovers(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jenis-sp-approvers"] });
      toast.success("Approver berhasil disimpan", {
        position: "top-center",
        richColors: true,
      });
    },
    onError: (error) => {
      toast.error(error.message, { position: "top-center", richColors: true });
    },
  });
};
