"use client";

import { useQueryState, parseAsInteger } from "nuqs";
import { useAttendanceHistory } from "@/hooks/use-attendance";

export function useUserHistoryPage() {
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: true }),
  );
  const limit = 10;

  const { data, isLoading } = useAttendanceHistory(page, limit);

  const attendances = data?.data || [];
  const meta = data?.meta;

  return {
    page,
    setPage,
    isLoading,
    attendances,
    meta,
  };
}
