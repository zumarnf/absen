import { startOfDay, endOfDay } from "date-fns";

/**
 * Get period boundaries for monthly calculation (from 15th to 15th)
 * Example: December period = Dec 15 - Jan 15
 */
export const getMonthlyPeriod = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-11
  const day = date.getDate();

  let periodStart: Date;
  let periodEnd: Date;

  // If current day is before 15th, period is from previous month's 15th
  if (day < 15) {
    // Period: Previous Month 15 - Current Month 14
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;

    periodStart = new Date(prevYear, prevMonth, 15, 0, 0, 0);
    periodEnd = new Date(year, month, 14, 23, 59, 59);
  } else {
    // Period: Current Month 15 - Next Month 14
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;

    periodStart = new Date(year, month, 15, 0, 0, 0);
    periodEnd = new Date(nextYear, nextMonth, 14, 23, 59, 59);
  }

  return {
    periodStart: startOfDay(periodStart),
    periodEnd: endOfDay(periodEnd),
  };
};

/**
 * Format period name for display
 * Example: "15 Des 2024 - 15 Jan 2025"
 */
export const formatPeriodName = (
  periodStart: Date,
  periodEnd: Date,
): string => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];

  const startDay = periodStart.getDate();
  const startMonth = months[periodStart.getMonth()];
  const startYear = periodStart.getFullYear();

  const endDay = periodEnd.getDate();
  const endMonth = months[periodEnd.getMonth()];
  const endYear = periodEnd.getFullYear();

  return `${startDay} ${startMonth} ${startYear} - ${endDay} ${endMonth} ${endYear}`;
};

/**
 * Check if date is today
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * Get start and end of today
 */
export const getTodayBoundaries = () => {
  const now = new Date();
  return {
    startOfToday: startOfDay(now),
    endOfToday: endOfDay(now),
  };
};
