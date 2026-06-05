import { Request } from "express";
import { Document, Types } from "mongoose";

// ============================================
// USER TYPES
// ============================================
export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  password: string;
  nama: string;
  role: "admin" | "user";
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserResponse {
  _id: string;
  username: string;
  nama: string;
  role: "admin" | "user";
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// SHIFT TYPES
// ============================================
export type ShiftNumber = 1 | 2 | 3 | 4 | 5;
export type PosNumber = 1 | 2;

export interface IShiftInfo {
  shiftNumber: ShiftNumber;
  startTime: string; // Format: "HH:mm"
  endTime: string; // Format: "HH:mm"
  duration: number; // dalam jam
}

// ============================================
// ATTENDANCE TYPES
// ============================================
export interface IShiftAttendance {
  shift: ShiftNumber;
  pos: PosNumber;
}

export interface IAttendance extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  date: Date;
  shifts: IShiftAttendance[];
  totalHours: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAttendanceResponse {
  _id: string;
  userId: string;
  user?: IUserResponse;
  date: Date;
  shifts: IShiftAttendance[];
  totalHours: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// SCHEDULE TYPES
// ============================================
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Minggu, 6 = Sabtu

export interface IScheduleShift {
  dayOfWeek: DayOfWeek;
  shifts: ShiftNumber[];
  pos: PosNumber;
}

export interface ISchedule extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  schedules: IScheduleShift[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IScheduleResponse {
  _id: string;
  userId: string;
  user?: IUserResponse;
  schedules: IScheduleShift[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// COURSE SCHEDULE TYPES
// ============================================
export interface ICourse {
  namaMataKuliah: string;
  hari: DayOfWeek;
  jamMulai: string; // Format: "HH:mm"
  jamSelesai: string; // Format: "HH:mm"
  ruangan?: string;
}

export interface ICourseSchedule extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  courses: ICourse[];
  semester: string;
  tahunAjaran: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICourseScheduleResponse {
  _id: string;
  userId: string;
  user?: IUserResponse;
  courses: ICourse[];
  semester: string;
  tahunAjaran: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// SHIFT COVERAGE TYPES
// ============================================
export type ShiftCoverageStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";

export interface IShiftCoverage extends Document {
  _id: Types.ObjectId;
  requesterId: Types.ObjectId;
  targetUserId: Types.ObjectId;
  date: Date;
  shift: ShiftNumber;
  pos: PosNumber;
  reason?: string;
  status: ShiftCoverageStatus;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// REQUEST TYPES
// ============================================
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    username: string;
    role: "admin" | "user";
  };
}

// ============================================
// API RESPONSE TYPES
// ============================================
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  meta?: PaginationMeta;
}

// ============================================
// AUTH TYPES
// ============================================
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  nama: string;
  role?: "admin" | "user";
}

export interface AuthResponse {
  token: string;
  user: IUserResponse;
}
