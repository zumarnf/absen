import type { User, UserInfo } from "./user";
import type { PaginationMeta } from "./api";

// ============================================
// SHIFT TYPES
// ============================================
export type ShiftNumber = 1 | 2 | 3 | 4 | 5;

export interface ShiftInfo {
  shiftNumber: ShiftNumber;
  name: string;
  startTime: string;
  endTime: string;
  duration: number;
}

export interface ShiftAttendance {
  shift: number;
  pos: 1 | 2;
}

// ============================================
// ATTENDANCE TYPES
// ============================================
export interface Attendance {
  _id: string;
  userId: string | User;
  date: string;
  shifts: ShiftAttendance[];
  totalHours: number;
  createdAt: string;
  updatedAt: string;
}

export interface CheckinRequest {
  shifts: ShiftAttendance[];
  date?: string;
}

export interface AttendanceResponse {
  success: boolean;
  message?: string;
  data: Attendance | Attendance[];
  meta?: PaginationMeta;
}

export interface MonthlySummary {
  period: string;
  periodStart: string;
  periodEnd: string;
  totalDays: number;
  totalShifts: number;
  totalHours: number;
  attendances: Attendance[];
}

// ============================================
// ATTENDANCE RESPONSE TYPES
// ============================================
export interface AllAttendanceResponse {
  success: boolean;
  data: Attendance[];
  meta: PaginationMeta;
}

export interface UserAttendanceResponse {
  success: boolean;
  data: {
    user: UserInfo;
    attendances: Attendance[];
  };
  meta: PaginationMeta;
}
