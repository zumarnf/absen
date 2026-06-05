import type { UserInfo } from "./user";

export type ShiftCoverageStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";

export interface ShiftCoverage {
  _id: string;
  requesterId: string | UserInfo;
  targetUserId: string | UserInfo;
  date: string;
  shift: number;
  pos: 1 | 2;
  reason?: string;
  status: ShiftCoverageStatus;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShiftCoverageRequest {
  targetUserId: string;
  date: string;
  shift: number;
  pos: 1 | 2;
  reason?: string;
}

export interface ShiftCoverageListResponse {
  success: boolean;
  data: ShiftCoverage[];
}

export interface ShiftCoverageResponse {
  success: boolean;
  data: ShiftCoverage;
}
