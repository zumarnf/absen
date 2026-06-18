import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { scheduleApi } from "@/features/schedules/api";
import { queryKeys } from "@/shared/lib/query-keys";
import type {
  ScheduleResponse,
  SingleScheduleResponse,
  GroupedSchedulesResponse,
  DaySchedule,
} from "@/shared/types";

/**
 * Invalidate every cached schedules query so admin tables, grouped views,
 * stats cards, and the affected user's "my schedule" page all refetch
 * after a create / update / delete mutation.
 */
export function invalidateSchedulesAll(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  queryClient.invalidateQueries({ queryKey: queryKeys.schedules.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.schedules.grouped });
  queryClient.invalidateQueries({ queryKey: queryKeys.schedules.stats });
  queryClient.invalidateQueries({ queryKey: queryKeys.schedules.my });
}

// Admin hooks
export function useAllSchedules() {
  return useQuery<ScheduleResponse>({
    queryKey: queryKeys.schedules.all,
    queryFn: () => scheduleApi.getAllSchedules(),
    placeholderData: keepPreviousData,
  });
}

export function useSchedulesStats() {
  return useQuery<ScheduleResponse>({
    queryKey: queryKeys.schedules.stats,
    queryFn: () => scheduleApi.getAllSchedules({ page: 1, limit: 100 }),
  });
}

export function useGroupedSchedules() {
  return useQuery<GroupedSchedulesResponse>({
    queryKey: queryKeys.schedules.grouped,
    queryFn: () => scheduleApi.getGroupedSchedules(),
  });
}

export function useCreateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { userId: string; schedules: DaySchedule[] }) =>
      scheduleApi.createSchedule(data),
    onSuccess: () => {
      toast.success("Schedule created successfully!");
      invalidateSchedulesAll(queryClient);
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } }
    ) => {
      toast.error("Failed to create schedule!", {
        description: error.response?.data?.message || error.message,
      });
    },
  });
}

export function useUpdateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { schedules: DaySchedule[] };
    }) => scheduleApi.updateSchedule(id, data),
    onSuccess: () => {
      toast.success("Schedule updated successfully!");
      invalidateSchedulesAll(queryClient);
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } }
    ) => {
      toast.error("Failed to update schedule!", {
        description: error.response?.data?.message || error.message,
      });
    },
  });
}

export function useDeleteSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => scheduleApi.deleteSchedule(id),
    onSuccess: () => {
      toast.success("Schedule deleted successfully!");
      invalidateSchedulesAll(queryClient);
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } }
    ) => {
      toast.error("Failed to delete schedule!", {
        description: error.response?.data?.message || error.message,
      });
    },
  });
}

// User hooks
export function useMySchedule() {
  return useQuery<SingleScheduleResponse>({
    queryKey: queryKeys.schedules.my,
    queryFn: () => scheduleApi.getMySchedule(),
  });
}
