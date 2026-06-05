import axiosInstance from "../axios";
import type {
  AllAttendanceResponse,
  UserAttendanceResponse,
  ShiftAttendance,
} from "@/types/attendance";

interface AttendanceHistoryParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export const attendanceApi = {
  checkin: async (data: {
    shifts: ShiftAttendance[];
    date?: string;
  }): Promise<{ success: boolean; data: unknown }> => {
    const response = await axiosInstance.post("/attendance/checkin", data);
    return response.data;
  },

  getHistory: async (
    params?: AttendanceHistoryParams,
  ): Promise<AllAttendanceResponse> => {
    const response = await axiosInstance.get("/attendance/history", { params });
    return response.data;
  },

  getMonthlySummary: async (
    date?: string,
  ): Promise<{
    success: boolean;
    data: { totalDays: number; totalHours: number; period: string };
  }> => {
    const response = await axiosInstance.get("/attendance/monthly", {
      params: { date },
    });
    return response.data;
  },

  getUserAttendance: async (
    userId: string,
    params?: AttendanceHistoryParams,
  ): Promise<UserAttendanceResponse> => {
    const response = await axiosInstance.get(`/attendance/user/${userId}`, {
      params,
    });
    return response.data;
  },

  getAllAttendance: async (
    params?: AttendanceHistoryParams,
  ): Promise<AllAttendanceResponse> => {
    const response = await axiosInstance.get("/attendance/all", { params });
    return response.data;
  },
};
