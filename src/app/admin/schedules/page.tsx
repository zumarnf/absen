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
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Trash2, Edit, MapPin, AlertTriangle } from "lucide-react";
import { getUserInfo } from "@/shared/lib/helpers";
import { DAYS, SHIFTS } from "@/shared/lib/constants";
import { ButtonLoader } from "@/shared/components/loader";
import { EmptyState } from "@/shared/components/empty-state";
import { CardListSkeleton } from "@/shared/components/card-list-skeleton";
import { flattenScheduleByDay } from "@/features/schedules/helpers";
import { useAdminSchedulesPage } from "@/features/schedules/hooks/use-admin-schedules-page";
import dynamic from "next/dynamic";

const ConfirmDialog = dynamic(
  () =>
    import("@/shared/components/confirm-dialog").then(
      (mod) => mod.ConfirmDialog
    ),
  { ssr: false, loading: () => null }
);

export default function AdminSchedulesPage() {
  const {
    isCreating,
    setIsCreating,
    editingSchedule,
    selectedUserId,
    setSelectedUserId,
    deleteDialog,
    setDeleteDialog,
    isLoading,
    schedules,
    users,
    isPending,
    selectedShiftsCount,
    deleteMutation,
    handlePosChange,
    getSelectedPos,
    isShiftSelected,
    handleSubmit,
    handleEdit,
    resetForm,
    handleDeleteDialogChange,
    handleDeleteConfirm,
    userCourses,
    getConflictsFor,
  } = useAdminSchedulesPage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Shift Schedules
        </h1>
        <p className="text-muted-foreground mt-1">
          Kelola jadwal shift untuk semua user
        </p>
      </div>

      {/* Create/Edit Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                {editingSchedule
                  ? "Edit Shift Schedule"
                  : "Create Shift Schedule"}
              </CardTitle>
              <CardDescription>
                {editingSchedule
                  ? "Update jadwal shift untuk user"
                  : "Buat jadwal shift mingguan untuk user. Klik pos untuk memilih shift."}
              </CardDescription>
            </div>
            <Button
              variant={isCreating ? "outline" : "default"}
              onClick={() => (isCreating ? resetForm() : setIsCreating(true))}
              className="rounded-lg transition-all duration-200"
            >
              {isCreating ? (
                "Cancel"
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" /> Create New
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        {isCreating && (
          <CardContent className="space-y-6">
            {/* User Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Select User
              </label>
              <Select
                value={selectedUserId}
                onValueChange={setSelectedUserId}
                disabled={!!editingSchedule}
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Pilih user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.nama} (@{user.username})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {editingSchedule && (
                <p className="text-xs text-muted-foreground mt-1">
                  Cannot change user when editing. Delete and create new if
                  needed.
                </p>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-muted/50 border rounded-lg p-4">
              <h4 className="font-medium text-foreground mb-2">
                Cara Memilih Jadwal:
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>
                  Klik tombol <Badge className="bg-[#edf3ec]0">P1</Badge> atau{" "}
                  <Badge className="bg-[#e8f0fb]0">P2</Badge> untuk memilih pos
                  pada shift tersebut
                </li>
                <li>User bisa ditempatkan di kedua pos asal beda shift/hari</li>
                <li>Klik lagi untuk membatalkan pilihan</li>
                <li>Maksimal 3 user per shift per pos</li>
              </ul>
            </div>

            {/* Conflict Detection Notice */}
            {selectedUserId && userCourses.length > 0 && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-[#fbf3db] border border-[#f0e3bf] text-sm text-[#8a5a00]">
                <AlertTriangle className="h-4 w-4 text-[#8a5a00] mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Deteksi Konflik Aktif</p>
                  <p className="text-xs text-[#8a5a00]">
                    User memiliki {userCourses.length} jadwal kuliah. Sel yang
                    bentrok akan ditandai. Anda tetap bisa memilih, namun
                    perhatikan jam kuliah user.
                  </p>
                </div>
              </div>
            )}

            {/* Schedule Grid */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Weekly Schedule ({selectedShiftsCount} shift dipilih)
              </label>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-24">Day</TableHead>
                      {SHIFTS.map((shift) => (
                        <TableHead key={shift} className="text-center">
                          <div>Shift {shift}</div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {DAYS.map((day) => (
                      <TableRow key={day.value}>
                        <TableCell className="font-medium">
                          {day.label}
                        </TableCell>
                        {SHIFTS.map((shift) => {
                          const selectedPos = getSelectedPos(day.value, shift);
                          const conflicts = getConflictsFor(day.value, shift);
                          const isConflict = conflicts.length > 0;
                          const conflictTitle = isConflict
                            ? `Bentrok dengan: ${conflicts
                                .map(
                                  (c) =>
                                    `${c.namaMataKuliah} (${c.jamMulai}-${c.jamSelesai})`,
                                )
                                .join(", ")}`
                            : undefined;
                          return (
                            <TableCell
                              key={shift}
                              className={`text-center ${
                                isConflict ? "bg-[#fbf3db]/60" : ""
                              }`}
                              title={conflictTitle}
                            >
                              <div className="flex flex-col items-center gap-1">
                                <div className="flex justify-center gap-1">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant={
                                      selectedPos === 1 ? "default" : "outline"
                                    }
                                    className={`h-8 w-10 text-xs rounded-lg transition-all duration-200 ${
                                      selectedPos === 1
                                        ? "bg-[#346538] hover:bg-[#2b5430]"
                                        : "hover:bg-[#edf3ec] hover:text-[#346538] hover:border-[#d6e4d5]"
                                    } ${
                                      isConflict && selectedPos !== 1
                                        ? "border-[#8a5a00] text-[#8a5a00]"
                                        : ""
                                    }`}
                                    onClick={() =>
                                      handlePosChange(day.value, shift, 1)
                                    }
                                  >
                                    P1
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant={
                                      selectedPos === 2 ? "default" : "outline"
                                    }
                                    className={`h-8 w-10 text-xs rounded-lg transition-all duration-200 ${
                                      selectedPos === 2
                                        ? "bg-[#1f5c93] hover:bg-[#1a4f7d]"
                                        : "hover:bg-[#e8f0fb] hover:text-[#1f5c93] hover:border-[#d3e1f3]"
                                    } ${
                                      isConflict && selectedPos !== 2
                                        ? "border-[#8a5a00] text-[#8a5a00]"
                                        : ""
                                    }`}
                                    onClick={() =>
                                      handlePosChange(day.value, shift, 2)
                                    }
                                  >
                                    P2
                                  </Button>
                                </div>
                                {isConflict && (
                                  <AlertTriangle
                                    className="h-3 w-3 text-[#8a5a00]"
                                    aria-label="Bentrok dengan jadwal kuliah"
                                  />
                                )}
                              </div>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Selected Summary */}
            {selectedShiftsCount > 0 && (
              <div className="bg-muted/50 rounded-lg p-4 animate-fade-in-up">
                <h4 className="font-medium text-foreground mb-2">
                  Ringkasan Jadwal:
                </h4>
                <div className="grid grid-cols-7 gap-2">
                  {DAYS.map((day) => {
                    const dayShifts = SHIFTS.filter((shift) =>
                      isShiftSelected(day.value, shift),
                    );
                    return (
                      <div key={day.value} className="text-center">
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          {day.short}
                        </p>
                        {dayShifts.length > 0 ? (
                          <div className="space-y-1">
                            {dayShifts.map((shift) => {
                              const pos = getSelectedPos(day.value, shift);
                              return (
                                <div
                                  key={shift}
                                  className={`px-1 py-0.5 rounded-md text-xs ${
                                    pos === 1
                                      ? "bg-[#edf3ec] text-[#346538]"
                                      : "bg-[#e8f0fb] text-[#1f5c93]"
                                  }`}
                                >
                                  S{shift}-P{pos}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">-</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={
                isPending || !selectedUserId || selectedShiftsCount === 0
              }
              className="w-full rounded-lg "
            >
              {isPending ? (
                <ButtonLoader
                  message={editingSchedule ? "Updating..." : "Creating..."}
                />
              ) : editingSchedule ? (
                "Update Schedule"
              ) : (
                "Create Schedule"
              )}
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Existing Schedules */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Schedules</CardTitle>
          <CardDescription>
            Daftar jadwal shift yang sudah dibuat
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <CardListSkeleton count={3} innerRows={1} />
          ) : schedules.length === 0 ? (
            <EmptyState message="Belum ada schedule" />
          ) : (
            <div className="space-y-4">
              {schedules.map((schedule, sIndex) => {
                const user = getUserInfo(schedule.userId);
                const scheduleByDay = flattenScheduleByDay(schedule.schedules);

                return (
                  <div
                    key={schedule._id}
                    className={`p-4 border rounded-lg card-hover animate-fade-in-up delay-${sIndex + 1}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-foreground">
                          {user?.nama || "Unknown User"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          @{user?.username || "unknown"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                            schedule.isActive
                              ? "bg-[#edf3ec] text-[#346538]"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {schedule.isActive ? "Active" : "Inactive"}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(schedule)}
                          className="rounded-lg hover:bg-accent transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
                          onClick={() =>
                            setDeleteDialog({
                              open: true,
                              scheduleId: schedule._id,
                            })
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {DAYS.map((day) => {
                        const dayShifts = scheduleByDay[day.value] || [];
                        dayShifts.sort((a, b) => a.shift - b.shift);

                        return (
                          <div key={day.value} className="text-center">
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              {day.short}
                            </p>
                            {dayShifts.length > 0 ? (
                              <div className="space-y-1">
                                {dayShifts.map(({ shift, pos }) => (
                                  <div
                                    key={`${shift}-${pos}`}
                                    className={`px-1 py-0.5 rounded-md text-xs flex items-center justify-center gap-0.5 ${
                                      pos === 1
                                        ? "bg-[#edf3ec] text-[#346538]"
                                        : "bg-[#e8f0fb] text-[#1f5c93]"
                                    }`}
                                  >
                                    <span>{shift}</span>
                                    <MapPin className="h-2.5 w-2.5" />
                                    <span>{pos}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground">-</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={handleDeleteDialogChange}
        title="Delete Schedule?"
        description="Are you sure you want to delete this schedule? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
