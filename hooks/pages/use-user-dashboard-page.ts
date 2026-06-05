"use client";

import { useAuthStore } from "@/stores/auth-store";
import { Calendar, Clock, TrendingUp } from "lucide-react";
import { useRecentAttendance, useMonthlySummary } from "@/hooks/use-attendance";
import { useGroupedSchedules } from "@/hooks/use-schedules";
import type { StatItem } from "@/components/shared/stats-grid";

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
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Jam Kerja",
      value: `${summary?.totalHours || 0} jam`,
      icon: Clock,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Periode Bulan Ini",
      value: summary?.period || "-",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
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
