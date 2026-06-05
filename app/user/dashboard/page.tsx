"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScheduleOverview } from "@/components/schedules/schedule-overview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsGrid } from "@/components/shared/stats-grid";
import { ScheduleGridSkeleton } from "@/components/shared/schedule-grid-skeleton";
import { ShiftPosBadge } from "@/components/shared/shift-pos-badge";
import { useUserDashboardPage } from "@/hooks/pages/use-user-dashboard-page";

export default function UserDashboard() {
  const {
    user,
    recentAttendance,
    stats,
    groupedSchedulesData,
    isLoadingGrouped,
  } = useUserDashboardPage();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Selamat Datang, {user?.nama || "User"}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Ringkasan aktivitas absensi Anda
        </p>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 rounded-xl p-1">
          <TabsTrigger value="overview" className="rounded-lg">
            Overview
          </TabsTrigger>
          <TabsTrigger value="schedules" className="rounded-lg">
            Jadwal Lengkap
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Grid */}
          <StatsGrid stats={stats} />

          {/* Recent Attendance */}
          <Card className="animate-fade-in-up delay-4">
            <CardHeader>
              <CardTitle>Recent Attendance</CardTitle>
              <CardDescription>5 absensi terakhir Anda</CardDescription>
            </CardHeader>
            <CardContent>
              {recentAttendance.length > 0 ? (
                <div className="space-y-3">
                  {recentAttendance.map((attendance, index) => (
                    <div
                      key={attendance._id}
                      className={`flex items-center justify-between p-3.5 bg-slate-50/70 rounded-xl transition-all duration-200 hover:bg-slate-100/80 hover:shadow-sm animate-fade-in-up delay-${index + 1}`}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-foreground">
                          {new Date(attendance.date).toLocaleDateString(
                            "id-ID",
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {attendance.shifts.map((shiftData, index) => (
                            <ShiftPosBadge
                              key={`${attendance._id}-${shiftData.shift}-${shiftData.pos}-${index}`}
                              shift={shiftData.shift}
                              pos={shiftData.pos}
                              size="sm"
                            />
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-indigo-600">
                          {attendance.totalHours} jam
                        </p>
                      </div>
                    </div>
                  ))}
                  <Link href="/user/history">
                    <Button
                      variant="link"
                      className="w-full text-solid-primary hover:text-solid-dark"
                    >
                      View All History →
                    </Button>
                  </Link>
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  Belum ada attendance
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-500" />
                Jadwal Semua User
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
