import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { attendanceApi } from "@/features/attendance/api";
import { queryKeys } from "@/shared/lib/query-keys";
import type {
  AllAttendanceResponse,
  UserAttendanceResponse,
  ShiftAttendance,
} from "@/shared/types";

interface AttendanceHistoryResponse {
  success: boolean;
  data: {
    _id: string;
    date: string;
    shifts: ShiftAttendance[];
    totalHours: number;
    createdAt: string;
  }[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

interface MonthlySummaryResponse {
  success: boolean;
  data: {
    totalDays: number;
    totalHours: number;
    period: string;
  };
}

// User hooks
export function useAttendanceHistory(page: number, limit: number) {
  return useQuery<AttendanceHistoryResponse>({
    queryKey: queryKeys.attendance.myHistory(page, limit),
    queryFn: () => attendanceApi.getHistory({ page, limit }),
    placeholderData: keepPreviousData,
  });
}

export function useRecentAttendance(limit = 5) {
  return useQuery<AttendanceHistoryResponse>({
    queryKey: queryKeys.attendance.myHistory(),
    queryFn: () => attendanceApi.getHistory({ page: 1, limit }),
  });
}

export function useMonthlySummary() {
  return useQuery<MonthlySummaryResponse>({
    queryKey: queryKeys.attendance.mySummary,
    queryFn: () => attendanceApi.getMonthlySummary(),
  });
}

export function useCheckin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { shifts: ShiftAttendance[] }) =>
      attendanceApi.checkin(data),
    onSuccess: () => {
      toast.success("Check-in berhasil!");
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.myHistory(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.mySummary,
      });
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } }
    ) => {
      toast.error("Check-in gagal!", {
        description: error.response?.data?.message || error.message,
      });
    },
  });
}

// Admin hooks
export function useAllAttendance(page: number, limit: number, enabled = true) {
  return useQuery<AllAttendanceResponse>({
    queryKey: queryKeys.attendance.all(page, limit),
    queryFn: () => attendanceApi.getAllAttendance({ page, limit }),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useAttendanceStats() {
  return useQuery<AllAttendanceResponse>({
    queryKey: queryKeys.attendance.stats,
    queryFn: () => attendanceApi.getAllAttendance({ page: 1, limit: 100 }),
  });
}

export function useUserAttendance(
  userId: string,
  page: number,
  limit: number,
  enabled = true
) {
  return useQuery<UserAttendanceResponse>({
    queryKey: queryKeys.attendance.user(userId, page, limit),
    queryFn: () => attendanceApi.getUserAttendance(userId, { page, limit }),
    enabled: !!userId && enabled,
    placeholderData: keepPreviousData,
  });
}

export function useExportAttendance(userId: string, enabled = true) {
  return useQuery<UserAttendanceResponse>({
    queryKey: queryKeys.attendance.export(userId),
    queryFn: () =>
      attendanceApi.getUserAttendance(userId, { page: 1, limit: 100 }),
    enabled: !!userId && enabled,
  });
}
