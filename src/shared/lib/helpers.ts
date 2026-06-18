import { SHIFT_TIMES, DAYS_ID } from "./constants";
import type { UserInfo } from "@/shared/types";

export const formatDate = (
  dateString: string,
  options?: Intl.DateTimeFormatOptions
) => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString(
    "id-ID",
    options || defaultOptions
  );
};

export const formatDateLong = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatDateWithDay = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDatePDF = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const getDayName = (dateString: string) => {
  const date = new Date(dateString);
  return DAYS_ID[date.getDay()];
};

export const getUserInfo = (
  userId: string | UserInfo | { _id: string; username: string; nama: string; role: string }
): UserInfo | null => {
  if (typeof userId === "object" && userId !== null) {
    return userId as UserInfo;
  }
  return null;
};

export const getShiftTimeRanges = (
  shifts: { shift: number; pos: 1 | 2 }[]
) => {
  if (!shifts || shifts.length === 0) return "";

  const sortedShifts = [...shifts].sort((a, b) => a.shift - b.shift);
  const timeRanges = sortedShifts.map((s) => {
    const time = SHIFT_TIMES[s.shift];
    return time ? `${time.start}-${time.end}` : "";
  });

  return timeRanges.filter(Boolean).join(", ");
};
