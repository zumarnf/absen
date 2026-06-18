"use client";

import { useAuthStore } from "@/features/auth/store";
import { Calendar, Clock, TrendingUp } from "lucide-react";
import { useRecentAttendance, useMonthlySummary } from "@/features/attendance/hooks/use-attendance";
import { useGroupedSchedules } from "@/features/schedules/hooks/use-schedules";
import type { StatItem } from "@/shared/components/stats-grid";

export function useUserDashboardPage() {
  const { user } = useAuthStore();

  const { data: historyData } = useRecentAttendance(5);
  const { data: summaryData } = useMonthlySummary();
  const { data: groupedSchedulesData, isLoading: isLoadingGrouped } =
    useGroupedSchedules();

  const recentAttendance = historyData?.data || [];
  const summary = summaryData?.data;

  const stats: StatItem[] = [
    {
      title: "Total Hari Kerja",
      value: summary?.totalDays || 0,
      icon: Calendar,
    },
    {
      title: "Total Jam Kerja",
      value: `${summary?.totalHours || 0} jam`,
      icon: Clock,
    },
    {
      title: "Periode Bulan Ini",
      value: summary?.period || "-",
      icon: TrendingUp,
      small: true,
    },
  ];

  return {
    user,
    recentAttendance,
    stats,
    groupedSchedulesData,
    isLoadingGrouped,
  };
}
