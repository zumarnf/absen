"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ClipboardList, Calendar, BookOpen, Users, Radio } from "lucide-react";
import dynamic from "next/dynamic";
import { useAttendanceStats } from "@/hooks/use-attendance";
import { useSchedulesStats, useGroupedSchedules } from "@/hooks/use-schedules";
import { useCoursesStats } from "@/hooks/use-courses";
import { useRealtimeEvents } from "@/hooks/use-realtime-events";
import { PageLoader } from "@/components/shared/loader";
import { StatsGrid, type StatItem } from "@/components/shared/stats-grid";
import { ScheduleGridSkeleton } from "@/components/shared/schedule-grid-skeleton";

const ScheduleOverview = dynamic(
  () =>
    import("@/components/schedules/schedule-overview").then(
      (mod) => mod.ScheduleOverview
    ),
  {
    loading: () => <PageLoader message="Loading jadwal..." />,
  }
);

export default function AdminDashboard() {
  const { data: attendanceData } = useAttendanceStats();
  const { data: schedulesData } = useSchedulesStats();
  const { data: coursesData } = useCoursesStats();
  const { data: groupedSchedulesData, isLoading: isLoadingGrouped } =
    useGroupedSchedules();
  const { status: realtimeStatus } = useRealtimeEvents();

  const stats: StatItem[] = [
    {
      title: "Total Attendance Records",
      value: attendanceData?.meta?.totalItems || 0,
      icon: ClipboardList,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      title: "Active Schedules",
      value: schedulesData?.data?.filter((s) => s.isActive).length || 0,
      icon: Calendar,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Course Schedules",
      value: coursesData?.meta?.totalItems || 0,
      icon: BookOpen,
      color: "text-violet-600",
      bgColor: "bg-violet-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="animate-fade-in-up flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Overview statistik sistem absensi
          </p>
        </div>
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
            realtimeStatus === "open"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-slate-50 text-slate-500 border border-slate-200"
          }`}
          title={`Realtime status: ${realtimeStatus}`}
        >
          <Radio
            className={`h-3 w-3 ${
              realtimeStatus === "open" ? "animate-pulse text-emerald-500" : ""
            }`}
          />
          {realtimeStatus === "open" ? "Live" : "Offline"}
        </div>
      </div>

      {/* Stats Grid */}
      <StatsGrid stats={stats} />

      {/* Jadwal Shift Semua User */}
      <Card className="animate-fade-in-up delay-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-500" />
            Jadwal Shift Semua User
          </CardTitle>
          <CardDescription>
            Jadwal lengkap berdasarkan hari, shift, dan pos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingGrouped ? (
            <ScheduleGridSkeleton />
          ) : groupedSchedulesData?.data ? (
            <ScheduleOverview data={groupedSchedulesData.data} />
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              Belum ada jadwal aktif
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
