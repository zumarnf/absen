import axiosInstance from "../axios";
import type {
  ScheduleResponse,
  SingleScheduleResponse,
  GroupedSchedulesResponse,
  DaySchedule,
} from "@/types/schedule";

interface PaginationParams {
  page?: number;
  limit?: number;
}

export const scheduleApi = {
  createSchedule: async (data: {
    userId: string;
    schedules: DaySchedule[];
  }): Promise<{ success: boolean; data: unknown }> => {
    const response = await axiosInstance.post("/schedules", data);
    return response.data;
  },

  getMySchedule: async (): Promise<SingleScheduleResponse> => {
    const response = await axiosInstance.get("/schedules/me");
    return response.data;
  },

  getUserSchedule: async (userId: string): Promise<SingleScheduleResponse> => {
    const response = await axiosInstance.get(`/schedules/user/${userId}`);
    return response.data;
  },

  getAllSchedules: async (
    params?: PaginationParams,
  ): Promise<ScheduleResponse> => {
    const response = await axiosInstance.get("/schedules/all", { params });
    return response.data;
  },

  getGroupedSchedules: async (): Promise<GroupedSchedulesResponse> => {
    const response = await axiosInstance.get("/schedules/grouped");
    return response.data;
  },

  updateSchedule: async (
    id: string,
    data: { schedules: DaySchedule[] },
  ): Promise<{ success: boolean; data: unknown }> => {
    const response = await axiosInstance.put(`/schedules/${id}`, data);
    return response.data;
  },

  deleteSchedule: async (
    id: string,
  ): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.delete(`/schedules/${id}`);
    return response.data;
  },
};
