import type { User, UserInfo } from "./user";

// ============================================
// AUTH TYPES
// ============================================
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  nama: string;
  role?: "admin" | "user";
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export interface CreateUserResponse {
  success: boolean;
  data: {
    user: UserInfo;
  };
  message?: string;
}
