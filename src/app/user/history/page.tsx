"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { History } from "lucide-react";
import { formatDateLong } from "@/shared/lib/helpers";
import { Pagination } from "@/shared/components/pagination";
import { ShiftPosBadge } from "@/shared/components/shift-pos-badge";
import { EmptyState } from "@/shared/components/empty-state";
import { TableSkeleton } from "@/shared/components/table-skeleton";
import { useUserHistoryPage } from "@/features/attendance/hooks/use-user-history-page";

export default function HistoryPage() {
  const { page, setPage, isLoading, attendances, meta } = useUserHistoryPage();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-muted-foreground" />
            Attendance History
          </CardTitle>
          <CardDescription>Riwayat absensi Anda</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton columns={3} rows={6} />
          ) : attendances.length === 0 ? (
            <EmptyState message="Belum ada history attendance" />
          ) : (
            <>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Shift & Pos</TableHead>
                      <TableHead className="text-right">Total Jam</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendances.map((attendance) => (
                      <TableRow
                        key={attendance._id}
                        className="table-row-hover"
                      >
                        <TableCell className="font-medium">
                          {formatDateLong(attendance.date)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {attendance.shifts.map((shiftData, index) => (
                              <ShiftPosBadge
                                key={`${attendance._id}-shift-${index}`}
                                shift={shiftData.shift}
                                pos={shiftData.pos}
                              />
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-foreground">
                          {attendance.totalHours} jam
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {meta && (
                <Pagination
                  meta={meta}
                  currentPage={page}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
