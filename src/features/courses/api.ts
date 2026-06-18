import axiosInstance from "@/shared/lib/axios";
import type { CourseResponse, SingleCourseResponse } from "@/shared/types/course";

interface PaginationParams {
  page?: number;
  limit?: number;
}

export const courseApi = {
  createCourse: async (data: {
    semester: string;
    tahunAjaran: string;
    courses: {
      namaMataKuliah: string;
      hari: number;
      jamMulai: string;
      jamSelesai: string;
      ruangan?: string;
    }[];
  }): Promise<{ success: boolean; data: unknown }> => {
    const response = await axiosInstance.post("/courses", data);
    return response.data;
  },

  getMyCourse: async (): Promise<SingleCourseResponse> => {
    const response = await axiosInstance.get("/courses/me");
    return response.data;
  },

  getUserCourseSchedule: async (
    userId: string,
  ): Promise<SingleCourseResponse> => {
    const response = await axiosInstance.get(`/courses/user/${userId}`);
    return response.data;
  },

  getAllCourses: async (params?: PaginationParams): Promise<CourseResponse> => {
    const response = await axiosInstance.get("/courses/all", { params });
    return response.data;
  },

  updateCourse: async (
    id: string,
    data: {
      semester?: string;
      tahunAjaran?: string;
      courses?: {
        namaMataKuliah: string;
        hari: number;
        jamMulai: string;
        jamSelesai: string;
        ruangan?: string;
      }[];
    },
  ): Promise<{ success: boolean; data: unknown }> => {
    const response = await axiosInstance.put(`/courses/${id}`, data);
    return response.data;
  },

  deleteCourse: async (
    id: string,
  ): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.delete(`/courses/${id}`);
    return response.data;
  },
};
