"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScheduleOverview } from "@/features/schedules/components/schedule-overview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsGrid } from "@/shared/components/stats-grid";
import { ScheduleGridSkeleton } from "@/shared/components/schedule-grid-skeleton";
import { ShiftPosBadge } from "@/shared/components/shift-pos-badge";
import { useUserDashboardPage } from "@/features/dashboard/hooks/use-user-dashboard-page";

export default function UserDashboard() {
  const {
    user,
    recentAttendance,
    stats,
    groupedSchedulesData,
    isLoadingGrouped,
  } = useUserDashboardPage();

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="animate-fade-in-up">
        <h2 className="font-display text-2xl text-foreground">
          Selamat datang, {user?.nama || "User"}.
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Ringkasan aktivitas absensi Anda.
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full max-w-sm grid-cols-2">
          <TabsTrigger value="overview">Ringkasan</TabsTrigger>
          <TabsTrigger value="schedules">Jadwal Lengkap</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <StatsGrid stats={stats} />

          <Card className="animate-fade-in-up delay-4">
            <CardHeader>
              <CardTitle>Absensi Terbaru</CardTitle>
              <CardDescription>5 absensi terakhir Anda.</CardDescription>
            </CardHeader>
            <CardContent>
              {recentAttendance.length > 0 ? (
                <div className="space-y-2">
                  {recentAttendance.map((attendance) => (
                    <div
                      key={attendance._id}
                      className="flex items-center justify-between gap-4 rounded-lg border bg-muted/30 p-3.5 transition-colors hover:bg-muted/60"
                    >
                      <div className="min-w-0 flex-1">
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
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {attendance.shifts.map((shiftData, idx) => (
                            <ShiftPosBadge
                              key={`${attendance._id}-${shiftData.shift}-${shiftData.pos}-${idx}`}
                              shift={shiftData.shift}
                              pos={shiftData.pos}
                              size="sm"
                            />
                          ))}
                        </div>
                      </div>
                      <p className="nums shrink-0 text-right text-sm font-semibold text-foreground">
                        {attendance.totalHours} jam
                      </p>
                    </div>
                  ))}
                  <Button
                    asChild
                    variant="ghost"
                    className="mt-1 w-full justify-center text-muted-foreground"
                  >
                    <Link href="/user/history">
                      Lihat semua riwayat
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <p className="py-8 text-center text-muted-foreground">
                  Belum ada absensi.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users
                  className="h-5 w-5 text-muted-foreground"
                  strokeWidth={1.75}
                />
                Jadwal Semua User
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
