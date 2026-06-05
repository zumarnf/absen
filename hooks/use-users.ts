import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "@/lib/axios";
import { queryKeys } from "@/lib/query-keys";
import type { UsersResponse } from "@/types";

const USERS_STALE_TIME = 5 * 60 * 1000; // Users list changes rarely

/**
 * Invalidate every cached users query so all mounted consumers
 * (admin table, filter dropdowns, schedule picker, coverage target picker)
 * automatically refetch after a user mutation.
 */
export function invalidateUsersAll(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.users.forFilter });
  queryClient.invalidateQueries({ queryKey: queryKeys.users.forSchedule });
  queryClient.invalidateQueries({ queryKey: queryKeys.users.forCoverage });
}

export function useUsers(limit = 100) {
  return useQuery<UsersResponse>({
    queryKey: queryKeys.users.all,
    queryFn: async () => {
      const response = await axios.get<UsersResponse>("/users/all", {
        params: { limit },
      });
      return response.data;
    },
    staleTime: USERS_STALE_TIME,
  });
}

/**
 * Shared hook for fetching users in filter/schedule dropdowns.
 * Uses a separate query key to avoid cache conflicts with the main users list,
 * but shares the same API call.
 */
export function useUsersForSelect(
  queryKey: readonly string[] = queryKeys.users.forFilter,
) {
  return useQuery<UsersResponse>({
    queryKey,
    queryFn: async () => {
      const response = await axios.get<UsersResponse>("/users/all", {
        params: { limit: 100 },
      });
      return response.data;
    },
    staleTime: USERS_STALE_TIME,
  });
}

/**
 * Non-admin variant: minimal user list for dropdowns accessible to any
 * authenticated user (e.g., shift coverage target picker). Server-side
 * already excludes admins and the requester.
 */
export function useUsersForCoverage() {
  return useQuery<UsersResponse>({
    queryKey: queryKeys.users.forCoverage,
    queryFn: async () => {
      const response = await axios.get<UsersResponse>("/users/select");
      return response.data;
    },
    staleTime: USERS_STALE_TIME,
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await axios.delete(`/users/${userId}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("User berhasil dihapus!");
      invalidateUsersAll(queryClient);
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      toast.error("Gagal menghapus user!", {
        description: error.response?.data?.message || error.message,
      });
    },
  });
}
