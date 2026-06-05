import axiosInstance from "../axios";
import type {
  CreateShiftCoverageRequest,
  ShiftCoverageListResponse,
  ShiftCoverageResponse,
} from "@/types/shift-coverage";

export const shiftCoverageApi = {
  create: async (
    data: CreateShiftCoverageRequest,
  ): Promise<ShiftCoverageResponse> => {
    const response = await axiosInstance.post("/shift-coverages", data);
    return response.data;
  },

  listIncoming: async (): Promise<ShiftCoverageListResponse> => {
    const response = await axiosInstance.get("/shift-coverages/incoming");
    return response.data;
  },

  listOutgoing: async (): Promise<ShiftCoverageListResponse> => {
    const response = await axiosInstance.get("/shift-coverages/outgoing");
    return response.data;
  },

  approve: async (id: string): Promise<ShiftCoverageResponse> => {
    const response = await axiosInstance.post(
      `/shift-coverages/${id}/approve`,
    );
    return response.data;
  },

  reject: async (id: string): Promise<ShiftCoverageResponse> => {
    const response = await axiosInstance.post(
      `/shift-coverages/${id}/reject`,
    );
    return response.data;
  },

  cancel: async (id: string): Promise<ShiftCoverageResponse> => {
    const response = await axiosInstance.post(
      `/shift-coverages/${id}/cancel`,
    );
    return response.data;
  },
};
