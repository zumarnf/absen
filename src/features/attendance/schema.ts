import { z } from "zod";

export const checkinSchema = z.object({
  shifts: z
    .array(z.number().min(1).max(5))
    .min(1, "Pilih minimal 1 shift")
    .refine((shifts) => {
      const unique = new Set(shifts);
      return unique.size === shifts.length;
    }, "Shift tidak boleh duplikat"),
  date: z.string().optional(),
});

export type CheckinFormData = z.infer<typeof checkinSchema>;
