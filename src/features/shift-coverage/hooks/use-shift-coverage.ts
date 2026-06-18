import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { shiftCoverageApi } from "@/features/shift-coverage/api";
import { queryKeys } from "@/shared/lib/query-keys";
import type {
  CreateShiftCoverageRequest,
  ShiftCoverageListResponse,
} from "@/shared/types/shift-coverage";

export function useIncomingCoverages() {
  return useQuery<ShiftCoverageListResponse>({
    queryKey: queryKeys.shiftCoverages.incoming,
    queryFn: () => shiftCoverageApi.listIncoming(),
  });
}

export function useOutgoingCoverages() {
  return useQuery<ShiftCoverageListResponse>({
    queryKey: queryKeys.shiftCoverages.outgoing,
    queryFn: () => shiftCoverageApi.listOutgoing(),
  });
}

const invalidateAll = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({
    queryKey: queryKeys.shiftCoverages.incoming,
  });
  queryClient.invalidateQueries({
    queryKey: queryKeys.shiftCoverages.outgoing,
  });
};

export function useCreateCoverage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateShiftCoverageRequest) =>
      shiftCoverageApi.create(data),
    onSuccess: () => {
      toast.success("Permintaan pengganti shift dikirim");
      invalidateAll(queryClient);
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      toast.error("Gagal mengirim permintaan", {
        description: error.response?.data?.message || error.message,
      });
    },
  });
}

export function useApproveCoverage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => shiftCoverageApi.approve(id),
    onSuccess: () => {
      toast.success("Anda menyetujui menggantikan shift");
      invalidateAll(queryClient);
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      toast.error("Gagal menyetujui", {
        description: error.response?.data?.message || error.message,
      });
    },
  });
}

export function useRejectCoverage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => shiftCoverageApi.reject(id),
    onSuccess: () => {
      toast.success("Permintaan ditolak");
      invalidateAll(queryClient);
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      toast.error("Gagal menolak", {
        description: error.response?.data?.message || error.message,
      });
    },
  });
}

export function useCancelCoverage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => shiftCoverageApi.cancel(id),
    onSuccess: () => {
      toast.success("Permintaan dibatalkan");
      invalidateAll(queryClient);
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      toast.error("Gagal membatalkan", {
        description: error.response?.data?.message || error.message,
      });
    },
  });
}
