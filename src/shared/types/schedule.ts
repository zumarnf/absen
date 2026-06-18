import type { User, UserInfo } from "./user";
import type { ShiftNumber } from "./attendance";

// ============================================
// SCHEDULE TYPES
// ============================================
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface DaySchedule {
  dayOfWeek: number;
  shifts: number[];
  pos: 1 | 2;
}

export interface ScheduleShift {
  dayOfWeek: DayOfWeek;
  shifts: ShiftNumber[];
}

export interface Schedule {
  _id: string;
  userId: string | User | UserInfo;
  schedules: DaySchedule[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScheduleRequest {
  userId: string;
  schedules: ScheduleShift[];
}

// ============================================
// SCHEDULE RESPONSE TYPES
// ============================================
export interface ScheduleResponse {
  success: boolean;
  data: Schedule[];
}

export interface SingleScheduleResponse {
  success: boolean;
  data: Schedule | null;
}

// ============================================
// GROUPED SCHEDULES (for ScheduleOverview)
// ============================================
export interface ScheduleUserInfo {
  userId: string;
  username: string;
  nama: string;
  role: string;
}

export interface ShiftData {
  pos1: ScheduleUserInfo[];
  pos2: ScheduleUserInfo[];
}

export interface DayScheduleGrouped {
  dayName: string;
  shifts: {
    [shift: number]: ShiftData;
  };
}

export interface GroupedSchedules {
  [dayOfWeek: number]: DayScheduleGrouped;
}

export interface GroupedSchedulesResponse {
  success: boolean;
  data: GroupedSchedules;
}
