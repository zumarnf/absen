export const DAYS = [
  { value: 0, label: "Minggu", short: "Min" },
  { value: 1, label: "Senin", short: "Sen" },
  { value: 2, label: "Selasa", short: "Sel" },
  { value: 3, label: "Rabu", short: "Rab" },
  { value: 4, label: "Kamis", short: "Kam" },
  { value: 5, label: "Jumat", short: "Jum" },
  { value: 6, label: "Sabtu", short: "Sab" },
] as const;

export const SHIFTS = [1, 2, 3, 4, 5] as const;

export const SHIFT_TIMES: Record<number, { start: string; end: string }> = {
  1: { start: "06.00", end: "11.00" },
  2: { start: "11.00", end: "16.00" },
  3: { start: "16.00", end: "21.00" },
  4: { start: "21.00", end: "02.00" },
  5: { start: "02.00", end: "06.00" },
};

export const SHIFT_TIMES_DISPLAY: Record<number, string> = {
  1: "06:00 - 11:00",
  2: "11:00 - 16:00",
  3: "16:00 - 21:00",
  4: "21:00 - 02:00",
  5: "02:00 - 06:00",
};

export const SHIFTS_WITH_TIME = [
  { value: 1, label: "Shift 1", time: "06:00 - 11:00" },
  { value: 2, label: "Shift 2", time: "11:00 - 16:00" },
  { value: 3, label: "Shift 3", time: "16:00 - 21:00" },
  { value: 4, label: "Shift 4", time: "21:00 - 02:00" },
  { value: 5, label: "Shift 5", time: "02:00 - 06:00" },
] as const;

export const DAYS_ID: Record<number, string> = {
  0: "Minggu",
  1: "Senin",
  2: "Selasa",
  3: "Rabu",
  4: "Kamis",
  5: "Jumat",
  6: "Sabtu",
};
