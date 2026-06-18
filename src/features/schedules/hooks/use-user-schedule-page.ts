"use client";

import { useMySchedule } from "@/features/schedules/hooks/use-schedules";

interface GroupedShift {
  shift: number;
  pos: 1 | 2;
}

export function useUserSchedulePage() {
  const { data, isLoading } = useMySchedule();

  const mySchedule = data?.data;

  const getGroupedScheduleByDay = (dayOfWeek: number): GroupedShift[] => {
    if (!mySchedule) return [];

    const shifts: GroupedShift[] = [];

    mySchedule.schedules.forEach((schedule) => {
      if (schedule.dayOfWeek === dayOfWeek) {
        schedule.shifts.forEach((shift) => {
          shifts.push({
            shift,
            pos: schedule.pos,
          });
        });
      }
    });

    return shifts.sort((a, b) => a.shift - b.shift);
  };

  return {
    mySchedule,
    isLoading,
    getGroupedScheduleByDay,
  };
}
