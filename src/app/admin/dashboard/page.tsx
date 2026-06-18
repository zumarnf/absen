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
import { useAttendanceStats } from "@/features/attendance/hooks/use-attendance";
import {
  useSchedulesStats,
  useGroupedSchedules,
} from "@/features/schedules/hooks/use-schedules";
import { useCoursesStats } from "@/features/courses/hooks/use-courses";
import { useRealtimeEvents } from "@/shared/hooks/use-realtime-events";
import { PageLoader } from "@/shared/components/loader";
import { StatsGrid, type StatItem } from "@/shared/components/stats-grid";
import { ScheduleGridSkeleton } from "@/shared/components/schedule-grid-skeleton";

const ScheduleOverview = dynamic(
  () =>
    import("@/features/schedules/components/schedule-overview").then(
      (mod) => mod.ScheduleOverview,
    ),
  {
    loading: () => <PageLoader message="Memuat jadwal..." />,
  },
);

export default function AdminDashboard() {
  const { data: attendanceData } = useAttendanceStats();
  const { data: schedulesData } = useSchedulesStats();
  const { data: coursesData } = useCoursesStats();
  const { data: groupedSchedulesData, isLoading: isLoadingGrouped } =
    useGroupedSchedules();
  const { status: realtimeStatus } = useRealtimeEvents();

  const isLive = realtimeStatus === "open";

  const stats: StatItem[] = [
    {
      title: "Total Catatan Absensi",
      value: attendanceData?.meta?.totalItems || 0,
      icon: ClipboardList,
    },
    {
      title: "Jadwal Aktif",
      value: schedulesData?.data?.filter((s) => s.isActive).length || 0,
      icon: Calendar,
    },
    {
      title: "Jadwal Kuliah",
      value: coursesData?.meta?.totalItems || 0,
      icon: BookOpen,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 animate-fade-in-up sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display text-2xl text-foreground">
            Ringkasan Sistem
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Statistik absensi, jadwal, dan kuliah terkini.
          </p>
        </div>
        <span
          className={`tag ${isLive ? "tag-success" : "tag-neutral"}`}
          title={`Status realtime: ${realtimeStatus}`}
        >
          <Radio className={`h-3 w-3 ${isLive ? "animate-pulse" : ""}`} />
          {isLive ? "Live" : "Offline"}
        </span>
      </div>

      <StatsGrid stats={stats} />

      {/* All schedules */}
      <Card className="animate-fade-in-up delay-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
            Jadwal Shift Semua User
          </CardTitle>
          <CardDescription>
            Jadwal lengkap berdasarkan hari, shift, dan pos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingGrouped ? (
            <ScheduleGridSkeleton />
          ) : groupedSchedulesData?.data ? (
            <ScheduleOverview data={groupedSchedulesData.data} />
          ) : (
            <p className="py-8 text-center text-muted-foreground">
              Belum ada jadwal aktif.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
