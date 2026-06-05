import type { DaySchedule, Schedule } from "@/types";

/** Build a composite key for shift selection tracking */
export const getShiftKey = (dayOfWeek: number, shift: number): string =>
  `${dayOfWeek}-${shift}`;

/**
 * Convert shift-pos selections map to DaySchedule array for API submission.
 * Groups shifts by day+pos combination and sorts shifts ascending.
 */
export const convertToScheduleData = (
  selections: Record<string, 1 | 2>,
): DaySchedule[] => {
  const scheduleMap: Record<string, DaySchedule> = {};

  Object.entries(selections).forEach(([key, pos]) => {
    const [dayOfWeek, shift] = key.split("-").map(Number);
    const mapKey = `${dayOfWeek}-${pos}`;

    if (!scheduleMap[mapKey]) {
      scheduleMap[mapKey] = {
        dayOfWeek,
        shifts: [],
        pos: pos as 1 | 2,
      };
    }
    scheduleMap[mapKey].shifts.push(shift);
  });

  return Object.values(scheduleMap).map((schedule) => ({
    ...schedule,
    shifts: schedule.shifts.sort((a, b) => a - b),
  }));
};

/**
 * Extract selection map from an existing schedule (for edit mode).
 * Returns a Record<shiftKey, pos> matching the format used by the form.
 */
export const extractSelectionsFromSchedule = (
  schedule: Schedule,
): Record<string, 1 | 2> => {
  const selections: Record<string, 1 | 2> = {};
  schedule.schedules.forEach((daySchedule) => {
    daySchedule.shifts.forEach((shift) => {
      const key = getShiftKey(daySchedule.dayOfWeek, shift);
      selections[key] = daySchedule.pos;
    });
  });
  return selections;
};

/**
 * Flatten schedule day-groups into a per-day record for display.
 * Returns { [dayOfWeek]: Array<{shift, pos}> }
 */
export const flattenScheduleByDay = (
  schedules: DaySchedule[],
): Record<number, { shift: number; pos: 1 | 2 }[]> => {
  const byDay: Record<number, { shift: number; pos: 1 | 2 }[]> = {};

  schedules.forEach((daySchedule) => {
    daySchedule.shifts.forEach((shift) => {
      if (!byDay[daySchedule.dayOfWeek]) {
        byDay[daySchedule.dayOfWeek] = [];
      }
      byDay[daySchedule.dayOfWeek].push({
        shift,
        pos: daySchedule.pos,
      });
    });
  });

  return byDay;
};
