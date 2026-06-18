import type { User, UserInfo } from "./user";
import type { PaginationMeta } from "./api";

// ============================================
// COURSE TYPES
// ============================================
export interface Course {
  namaMataKuliah: string;
  hari: number;
  jamMulai: string;
  jamSelesai: string;
  ruangan?: string;
}

/** Alias for clarity: Course is the flat backend format */
export type BackendCourse = Course;

/** A single schedule entry within a grouped course item */
export interface ScheduleItem {
  hari: number;
  jamMulai: string;
  jamSelesai: string;
}

/** A course with multiple schedule entries (grouped format for form UI) */
export interface CourseItem {
  namaMataKuliah: string;
  ruangan?: string;
  schedules: ScheduleItem[];
}

export interface CourseSchedule {
  _id: string;
  userId: string | User | UserInfo;
  courses: Course[];
  semester: string;
  tahunAjaran: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseScheduleRequest {
  courses: Course[];
  semester: string;
  tahunAjaran: string;
}

// ============================================
// COURSE RESPONSE TYPES
// ============================================
export interface CourseResponse {
  success: boolean;
  data: CourseSchedule[];
  meta: PaginationMeta;
}

export interface SingleCourseResponse {
  success: boolean;
  data: CourseSchedule | null;
}
