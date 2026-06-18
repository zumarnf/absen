"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClipboardList, Download, Filter, X } from "lucide-react";
import { formatDateWithDay, getUserInfo } from "@/shared/lib/helpers";
import { Pagination } from "@/shared/components/pagination";
import { ShiftPosBadge } from "@/shared/components/shift-pos-badge";
import { EmptyState } from "@/shared/components/empty-state";
import { TableSkeleton } from "@/shared/components/table-skeleton";
import { useAdminAttendancePage } from "@/features/attendance/hooks/use-admin-attendance-page";
import dynamic from "next/dynamic";

const ExportPdfDialog = dynamic(
  () =>
    import("@/features/attendance/components/export-pdf-dialog").then(
      (mod) => mod.ExportPdfDialog
    ),
  { ssr: false, loading: () => null }
);

export default function AdminAttendancePage() {
  const {
    page,
    setPage,
    selectedUserId,
    exportDialogOpen,
    setExportDialogOpen,
    exportUserId,
    setExportUserId,
    isGeneratingPDF,
    isLoading,
    isLoadingExport,
    users,
    attendances,
    meta,
    selectedUser,
    exportUser,
    exportAttendanceData,
    handleUserFilter,
    clearFilter,
    getCurrentPeriod,
    handleGeneratePDF,
  } = useAdminAttendancePage();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-muted-foreground" />
                All Attendance Records
              </CardTitle>
              <CardDescription>
                {selectedUser
                  ? `Menampilkan absensi untuk: ${selectedUser.nama}`
                  : "Daftar semua absensi dari seluruh user"}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => setExportDialogOpen(true)}
              className="rounded-lg transition-all duration-200 "
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filter Section */}
          <div className="mb-6 p-4 bg-muted/50 rounded-lg border border">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Filter by User
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedUserId} onValueChange={handleUserFilter}>
                <SelectTrigger className="w-[280px] bg-card rounded-lg">
                  <SelectValue placeholder="Pilih user untuk filter..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.nama} (@{user.username})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedUserId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilter}
                  className="flex items-center gap-1 rounded-lg"
                >
                  <X className="h-4 w-4" />
                  Clear Filter
                </Button>
              )}
            </div>
          </div>

          {/* Active Filter Badge */}
          {selectedUser && (
            <div className="mb-4 flex items-center gap-2 animate-fade-in-up">
              <span className="text-sm text-muted-foreground">
                Active Filter:
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-muted text-foreground">
                {selectedUser.nama} (@{selectedUser.username})
                <button
                  onClick={clearFilter}
                  className="ml-2 hover:text-foreground transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            </div>
          )}

          {isLoading ? (
            <TableSkeleton columns={4} rows={6} />
          ) : attendances.length === 0 ? (
            <EmptyState
              message={
                selectedUserId
                  ? "Tidak ada data attendance untuk user ini"
                  : "Belum ada data attendance"
              }
            />
          ) : (
            <>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>User</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Shift & Pos</TableHead>
                      <TableHead className="text-right">Total Jam</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendances.map((attendance) => {
                      const user = getUserInfo(attendance.userId);
                      return (
                        <TableRow
                          key={attendance._id}
                          className="table-row-hover"
                        >
                          <TableCell className="font-medium">
                            {user ? (
                              <div>
                                <p className="font-medium">{user.nama}</p>
                                <p className="text-xs text-muted-foreground">
                                  @{user.username}
                                </p>
                              </div>
                            ) : (
                              "Unknown User"
                            )}
                          </TableCell>
                          <TableCell>
                            {formatDateWithDay(attendance.date)}
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
                      );
                    })}
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

      <ExportPdfDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        users={users}
        exportUserId={exportUserId}
        setExportUserId={setExportUserId}
        exportUser={exportUser}
        exportAttendanceData={exportAttendanceData}
        isLoadingExport={isLoadingExport}
        isGeneratingPDF={isGeneratingPDF}
        getCurrentPeriod={getCurrentPeriod}
        handleGeneratePDF={handleGeneratePDF}
      />
    </div>
  );
}
