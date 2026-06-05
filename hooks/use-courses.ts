import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { courseApi } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type { CourseResponse, SingleCourseResponse } from "@/types";

/**
 * Invalidate every cache entry related to courses so any list/detail
 * currently mounted (admin paginated table, stats card, "my course" view,
 * or a specific user's course) refetches automatically after a mutation.
 * Uses prefix matching: ["admin-all-courses"] matches every (page, limit)
 * variant produced by queryKeys.courses.all().
 */
export function invalidateCoursesAll(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  queryClient.invalidateQueries({ queryKey: ["admin-all-courses"] });
  queryClient.invalidateQueries({ queryKey: queryKeys.courses.stats });
  queryClient.invalidateQueries({ queryKey: queryKeys.courses.my });
  queryClient.invalidateQueries({ queryKey: ["admin-user-course"] });
}

// Admin hooks
export function useAllCourses(page: number, limit: number) {
  return useQuery<CourseResponse>({
    queryKey: queryKeys.courses.all(page, limit),
    queryFn: () => courseApi.getAllCourses({ page, limit }),
    placeholderData: keepPreviousData,
  });
}

export function useCoursesStats() {
  return useQuery<CourseResponse>({
    queryKey: queryKeys.courses.stats,
    queryFn: () => courseApi.getAllCourses({ page: 1, limit: 100 }),
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => courseApi.deleteCourse(id),
    onSuccess: () => {
      toast.success("Course schedule deleted successfully!");
      invalidateCoursesAll(queryClient);
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      toast.error("Failed to delete course schedule!", {
        description: error.response?.data?.message || error.message,
      });
    },
  });
}

// User hooks
export function useMyCourse() {
  return useQuery<SingleCourseResponse>({
    queryKey: queryKeys.courses.my,
    queryFn: () => courseApi.getMyCourse(),
  });
}

/**
 * Admin-only: fetch a specific user's active course schedule.
 * Returns null data (not error) when user has no active course schedule.
 */
export function useUserCourse(userId: string, enabled = true) {
  return useQuery<SingleCourseResponse>({
    queryKey: queryKeys.courses.byUser(userId),
    queryFn: async () => {
      try {
        return await courseApi.getUserCourseSchedule(userId);
      } catch (error) {
        const status = (error as { response?: { status?: number } })?.response
          ?.status;
        if (status === 404) {
          return { success: true, data: null };
        }
        throw error;
      }
    },
    enabled: !!userId && enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      semester: string;
      tahunAjaran: string;
      courses: {
        namaMataKuliah: string;
        hari: number;
        jamMulai: string;
        jamSelesai: string;
        ruangan?: string;
      }[];
    }) => courseApi.createCourse(data),
    onSuccess: () => {
      toast.success("Jadwal kuliah berhasil dibuat!");
      invalidateCoursesAll(queryClient);
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      toast.error("Gagal membuat jadwal kuliah!", {
        description: error.response?.data?.message || error.message,
      });
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        semester: string;
        tahunAjaran: string;
        courses: {
          namaMataKuliah: string;
          hari: number;
          jamMulai: string;
          jamSelesai: string;
          ruangan?: string;
        }[];
      };
    }) => courseApi.updateCourse(id, data),
    onSuccess: () => {
      toast.success("Jadwal kuliah berhasil diupdate!");
      invalidateCoursesAll(queryClient);
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      toast.error("Gagal update jadwal kuliah!", {
        description: error.response?.data?.message || error.message,
      });
    },
  });
}
