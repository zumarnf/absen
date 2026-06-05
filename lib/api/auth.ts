import axiosInstance from "../axios";
import type { AuthResponse, LoginRequest, RegisterRequest } from "@/types/auth";
import type { User } from "@/types/user";

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>(
      "/auth/login",
      credentials,
    );
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>(
      "/auth/register",
      data,
    );
    return response.data;
  },

  getProfile: async (): Promise<{ success: boolean; data: User }> => {
    const response = await axiosInstance.get("/auth/profile");
    return response.data;
  },

  verifyToken: async (): Promise<{
    success: boolean;
    data: { user: User };
  }> => {
    const response = await axiosInstance.get("/auth/verify");
    return response.data;
  },
};
