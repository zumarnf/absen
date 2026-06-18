"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, MapPin, Clock } from "lucide-react";
import { DAYS, SHIFT_TIMES_DISPLAY } from "@/shared/lib/constants";
import { ScheduleGridSkeleton } from "@/shared/components/schedule-grid-skeleton";
import { useUserSchedulePage } from "@/features/schedules/hooks/use-user-schedule-page";

export default function SchedulePage() {
  const { mySchedule, isLoading, getGroupedScheduleByDay } =
    useUserSchedulePage();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
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
                    className={`border rounded-lg p-4 text-center transition-all duration-200 animate-fade-in-up delay-${index + 1} ${
                      hasShifts
                        ? " bg-card card-hover"
                        : "bg-muted/40"
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
                                ? "bg-[#edf3ec] text-[#346538] border border-[#d6e4d5]"
                                : "bg-[#e8f0fb] text-[#1f5c93] border border-[#d3e1f3]"
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
            <MapPin className="h-4 w-4 text-muted-foreground" />
            Keterangan Pos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-[#edf3ec] rounded-lg border border-[#d6e4d5]">
              <div className="w-4 h-4 rounded-md bg-[#edf3ec]0"></div>
              <div>
                <p className="font-medium text-[#346538]">Pos 1</p>
                <p className="text-xs text-[#346538]">Lokasi pos pertama</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-[#e8f0fb] rounded-lg border border-[#d3e1f3]">
              <div className="w-4 h-4 rounded-md bg-[#e8f0fb]0"></div>
              <div>
                <p className="font-medium text-[#1f5c93]">Pos 2</p>
                <p className="text-xs text-[#1f5c93]">Lokasi pos kedua</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shift Times Info Card */}
      <Card className="animate-fade-in-up delay-5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Informasi Waktu Shift
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            {Object.entries(SHIFT_TIMES_DISPLAY).map(([shift, time]) => (
              <div
                key={shift}
                className="flex justify-between p-2.5 bg-muted/50 rounded-lg transition-colors hover:bg-muted"
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
