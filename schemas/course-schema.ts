import { z } from "zod";

// Flat format schema (used by backend API)
export const courseScheduleSchema = z.object({
  semester: z.string().min(1, "Semester harus diisi"),
  tahunAjaran: z.string().min(1, "Tahun ajaran harus diisi"),
  courses: z
    .array(
      z.object({
        namaMataKuliah: z.string().min(1, "Nama mata kuliah harus diisi"),
        hari: z.number().min(0).max(6),
        jamMulai: z
          .string()
          .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format jam: HH:mm"),
        jamSelesai: z
          .string()
          .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format jam: HH:mm"),
        ruangan: z.string().optional(),
      }),
    )
    .min(1, "Minimal 1 mata kuliah"),
});

// Schedule item sub-schema
const scheduleItemSchema = z.object({
  hari: z.number().min(0).max(6),
  jamMulai: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format: HH:MM"),
  jamSelesai: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format: HH:MM"),
});

// Grouped format schema (used by course form UI — nested schedules per course)
export const courseFormSchema = z.object({
  semester: z.string().min(1, "Semester wajib diisi"),
  tahunAjaran: z.string().regex(/^\d{4}\/\d{4}$/, "Format: 2024/2025"),
  courses: z
    .array(
      z.object({
        namaMataKuliah: z.string().min(1, "Nama mata kuliah wajib diisi"),
        ruangan: z.string().optional(),
        schedules: z.array(scheduleItemSchema).min(1, "Minimal 1 jadwal"),
      }),
    )
    .min(1, "Minimal 1 mata kuliah"),
});

export type CourseScheduleFormData = z.infer<typeof courseScheduleSchema>;
export type CourseFormData = z.infer<typeof courseFormSchema>;
