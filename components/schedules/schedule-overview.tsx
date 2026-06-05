"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, MapPin } from "lucide-react";
import { SHIFT_TIMES_DISPLAY } from "@/lib/constants";
import type { GroupedSchedules } from "@/types/schedule";

const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

const SHIFT_TIMES = [
  { shift: 1, time: SHIFT_TIMES_DISPLAY[1] },
  { shift: 2, time: SHIFT_TIMES_DISPLAY[2] },
  { shift: 3, time: SHIFT_TIMES_DISPLAY[3] },
  { shift: 4, time: SHIFT_TIMES_DISPLAY[4] },
  { shift: 5, time: SHIFT_TIMES_DISPLAY[5] },
];

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
          <Card
            key={dayIndex}
            className="overflow-hidden border-l-4 border-l-solid-primary"
          >
            <CardHeader className="bg-solid-surface border-b border-solid-primary/20">
              <CardTitle className="text-lg font-bold text-solid-dark tracking-wide uppercase">
                {dayName}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {SHIFT_TIMES.map(({ shift, time }) => {
                  const shiftData = daySchedule.shifts[shift];
                  const pos1Users = shiftData?.pos1 || [];
                  const pos2Users = shiftData?.pos2 || [];
                  const hasUsers = pos1Users.length > 0 || pos2Users.length > 0;

                  if (!hasUsers) return null;

                  return (
                    <div
                      key={shift}
                      className="border-l-4 border-blue-500 pl-4 pb-4"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="default" className="text-sm">
                          Shift {shift}
                        </Badge>
                        <span className="text-sm text-gray-600">{time}</span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Pos 1 */}
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                          <div className="flex items-center gap-2 mb-3">
                            <MapPin className="h-4 w-4 text-green-700" />
                            <h4 className="font-semibold text-green-900">
                              Pos 1
                            </h4>
                            <Badge
                              variant="outline"
                              className="ml-auto text-green-700 border-green-300"
                            >
                              {pos1Users.length}/3
                            </Badge>
                          </div>
                          {pos1Users.length > 0 ? (
                            <div className="space-y-2">
                              {pos1Users.map((user) => (
                                <div
                                  key={user.userId}
                                  className="flex items-center gap-2 bg-white rounded p-2 border border-green-200"
                                >
                                  <Users className="h-4 w-4 text-green-600" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {user.nama}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      @{user.username}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-green-600 italic">
                              Belum ada user
                            </p>
                          )}
                        </div>

                        {/* Pos 2 */}
                        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                          <div className="flex items-center gap-2 mb-3">
                            <MapPin className="h-4 w-4 text-purple-700" />
                            <h4 className="font-semibold text-purple-900">
                              Pos 2
                            </h4>
                            <Badge
                              variant="outline"
                              className="ml-auto text-purple-700 border-purple-300"
                            >
                              {pos2Users.length}/3
                            </Badge>
                          </div>
                          {pos2Users.length > 0 ? (
                            <div className="space-y-2">
                              {pos2Users.map((user) => (
                                <div
                                  key={user.userId}
                                  className="flex items-center gap-2 bg-white rounded p-2 border border-purple-200"
                                >
                                  <Users className="h-4 w-4 text-purple-600" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {user.nama}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      @{user.username}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-purple-600 italic">
                              Belum ada user
                            </p>
                          )}
                        </div>
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
