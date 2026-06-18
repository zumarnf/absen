"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, MapPin } from "lucide-react";
import { SHIFT_TIMES_DISPLAY } from "@/shared/lib/constants";
import type { GroupedSchedules } from "@/shared/types/schedule";

const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

const SHIFT_TIMES = [1, 2, 3, 4, 5].map((shift) => ({
  shift,
  time: SHIFT_TIMES_DISPLAY[shift as keyof typeof SHIFT_TIMES_DISPLAY],
}));

const POS_STYLES = {
  1: { tag: "tag-success", dot: "bg-[#346538]" },
  2: { tag: "tag-info", dot: "bg-[#1f5c93]" },
} as const;

interface PosColumnProps {
  pos: 1 | 2;
  users: { userId: string; nama: string; username: string }[];
}

function PosColumn({ pos, users }: PosColumnProps) {
  return (
    <div className="rounded-lg border bg-muted/40 p-4">
      <div className="mb-3 flex items-center gap-2">
        <MapPin className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
        <h4 className="text-sm font-semibold text-foreground">Pos {pos}</h4>
        <span className={`tag ${POS_STYLES[pos].tag} ml-auto`}>
          {users.length}/3
        </span>
      </div>
      {users.length > 0 ? (
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.userId}
              className="flex items-center gap-2 rounded-md border bg-card p-2"
            >
              <Users className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {user.nama}
                </p>
                <p className="text-xs text-muted-foreground">@{user.username}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm italic text-muted-foreground">Belum ada user</p>
      )}
    </div>
  );
}

interface ScheduleOverviewProps {
  data: GroupedSchedules;
}

export function ScheduleOverview({ data }: ScheduleOverviewProps) {
  return (
    <div className="space-y-4">
      {DAYS.map((dayName, dayIndex) => {
        const daySchedule = data[dayIndex];
        if (!daySchedule) return null;

        return (
          <Card key={dayIndex} className="overflow-hidden">
            <CardHeader className="border-b bg-muted/40">
              <CardTitle className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {dayName}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {SHIFT_TIMES.map(({ shift, time }) => {
                  const shiftData = daySchedule.shifts[shift];
                  const pos1Users = shiftData?.pos1 || [];
                  const pos2Users = shiftData?.pos2 || [];
                  if (pos1Users.length === 0 && pos2Users.length === 0) {
                    return null;
                  }

                  return (
                    <div key={shift} className="border-l-2 border-foreground pl-4">
                      <div className="mb-3 flex items-center gap-2">
                        <Badge variant="secondary">Shift {shift}</Badge>
                        <span className="nums text-sm text-muted-foreground">
                          {time}
                        </span>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <PosColumn pos={1} users={pos1Users} />
                        <PosColumn pos={2} users={pos2Users} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
