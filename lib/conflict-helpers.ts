import { SHIFT_TIMES } from "@/lib/constants";
import type { Course } from "@/types";

/** Parse a "HH.mm" or "HH:mm" string into minutes since 00:00. */
function timeToMinutes(time: string): number {
  const normalized = time.replace(".", ":");
  const [hours, minutes] = normalized.split(":").map(Number);
  return hours * 60 + (minutes || 0);
}

/**
 * Return the [startMin, endMin) range of a shift in minutes since 00:00.
 * Shifts that cross midnight (e.g. 21:00 - 02:00) extend past 1440.
 */
function getShiftRange(shift: number): { start: number; end: number } | null {
  const times = SHIFT_TIMES[shift];
  if (!times) return null;
  const start = timeToMinutes(times.start);
  let end = timeToMinutes(times.end);
  if (end <= start) end += 24 * 60;
  return { start, end };
}

/** Return the [startMin, endMin) range of a course (handles wrap-around). */
function getCourseRange(course: Course): { start: number; end: number } {
  const start = timeToMinutes(course.jamMulai);
  let end = timeToMinutes(course.jamSelesai);
  if (end <= start) end += 24 * 60;
  return { start, end };
}

/** Check whether two minute ranges overlap. */
function rangesOverlap(
  a: { start: number; end: number },
  b: { start: number; end: number },
): boolean {
  return a.start < b.end && b.start < a.end;
}

/**
 * Return all courses that overlap with the given shift on the given day.
 * Returns empty array when there's no conflict.
 */
export function findCourseConflicts(
  dayOfWeek: number,
  shift: number,
  courses: Course[] | undefined,
): Course[] {
  if (!courses || courses.length === 0) return [];
  const shiftRange = getShiftRange(shift);
  if (!shiftRange) return [];

  return courses.filter((course) => {
    if (course.hari !== dayOfWeek) return false;
    return rangesOverlap(shiftRange, getCourseRange(course));
  });
}
