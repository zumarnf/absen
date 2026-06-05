"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, MapPin, Clock } from "lucide-react";
import { DAYS, SHIFT_TIMES_DISPLAY } from "@/lib/constants";
import { ScheduleGridSkeleton } from "@/components/shared/schedule-grid-skeleton";
import { useUserSchedulePage } from "@/hooks/pages/use-user-schedule-page";

export default function SchedulePage() {
  const { mySchedule, isLoading, getGroupedScheduleByDay } =
    useUserSchedulePage();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-500" />
            Jadwal Shift Mingguan
          </CardTitle>
          <CardDescription>
            Jadwal shift yang ditetapkan untuk Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <ScheduleGridSkeleton />
          ) : !mySchedule ? (
            <div className="text-center py-12 animate-fade-in-up">
              <p className="text-muted-foreground">Belum ada jadwal shift</p>
              <p className="text-sm text-muted-foreground mt-2">
                Admin akan mengatur jadwal shift untuk Anda
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-3">
              {DAYS.map((day, index) => {
                const dayShifts = getGroupedScheduleByDay(day.value);
                const hasShifts = dayShifts.length > 0;

                return (
                  <div
                    key={day.value}
                    className={`border border-border/60 rounded-xl p-4 text-center transition-all duration-200 animate-fade-in-up delay-${index + 1} ${
                      hasShifts
                        ? "hover:shadow-md bg-white card-hover"
                        : "bg-slate-50/70"
                    }`}
                  >
                    <p className="font-semibold text-foreground mb-1">
                      {day.label}
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      {day.short}
                    </p>

                    {hasShifts ? (
                      <div className="space-y-2">
                        {dayShifts.map(({ shift, pos }) => (
                          <div
                            key={`${shift}-${pos}`}
                            className={`px-2 py-2 rounded-lg text-sm font-medium ${
                              pos === 1
                                ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                : "bg-violet-100 text-violet-700 border border-violet-200"
                            }`}
                          >
                            <div className="flex flex-col items-center gap-1">
                              <span>Shift {shift}</span>
                              <div className="flex items-center gap-1 text-xs opacity-80">
                                <MapPin className="h-3 w-3" />
                                <span>Pos {pos}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">Libur</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend Card */}
      <Card className="animate-fade-in-up delay-4">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-4 w-4 text-indigo-500" />
            Keterangan Pos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="w-4 h-4 rounded-md bg-emerald-500"></div>
              <div>
                <p className="font-medium text-emerald-900">Pos 1</p>
                <p className="text-xs text-emerald-700">Lokasi pos pertama</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-violet-50 rounded-xl border border-violet-200">
              <div className="w-4 h-4 rounded-md bg-violet-500"></div>
              <div>
                <p className="font-medium text-violet-900">Pos 2</p>
                <p className="text-xs text-violet-700">Lokasi pos kedua</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shift Times Info Card */}
      <Card className="animate-fade-in-up delay-5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-500" />
            Informasi Waktu Shift
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            {Object.entries(SHIFT_TIMES_DISPLAY).map(([shift, time]) => (
              <div
                key={shift}
                className="flex justify-between p-2.5 bg-slate-50 rounded-xl transition-colors hover:bg-slate-100/80"
              >
                <span className="font-medium text-foreground">
                  Shift {shift}:
                </span>
                <span>{time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
