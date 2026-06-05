"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Trash2, Lightbulb } from "lucide-react";
import { getUserInfo } from "@/lib/helpers";
import { DAYS } from "@/lib/constants";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { CardListSkeleton } from "@/components/shared/card-list-skeleton";
import { useAdminCoursesPage } from "@/hooks/pages/use-admin-courses-page";
import dynamic from "next/dynamic";

const ConfirmDialog = dynamic(
  () =>
    import("@/components/shared/confirm-dialog").then(
      (mod) => mod.ConfirmDialog
    ),
  { ssr: false, loading: () => null }
);

export default function AdminCoursesPage() {
  const {
    page,
    setPage,
    deleteDialog,
    isLoading,
    courses,
    meta,
    deleteMutation,
    handleDeleteDialogChange,
    handleDeleteConfirm,
    openDeleteDialog,
  } = useAdminCoursesPage();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-500" />
            Course Schedules
          </CardTitle>
          <CardDescription>
            Jadwal kuliah dari semua user untuk membantu arrange shift
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <CardListSkeleton count={3} innerRows={2} />
          ) : courses.length === 0 ? (
            <EmptyState message="Belum ada jadwal kuliah" />
          ) : (
            <>
              <div className="space-y-5">
                {courses.map((courseSchedule, csIndex) => {
                  const user = getUserInfo(courseSchedule.userId);

                  return (
                    <div
                      key={courseSchedule._id}
                      className={`border border-border/60 rounded-xl overflow-hidden card-hover animate-fade-in-up delay-${csIndex + 1}`}
                    >
                      {/* Header */}
                      <div className="bg-slate-50 p-4 border-b border-border/60">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {user?.nama || "Unknown User"}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              @{user?.username || "unknown"}
                            </p>
                            <div className="flex gap-3 mt-2 text-sm">
                              <span className="text-muted-foreground">
                                <strong className="text-foreground">
                                  Semester:
                                </strong>{" "}
                                {courseSchedule.semester || "-"}
                              </span>
                              <span className="text-muted-foreground">
                                <strong className="text-foreground">
                                  Tahun:
                                </strong>{" "}
                                {courseSchedule.tahunAjaran || "-"}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                                courseSchedule.isActive
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {courseSchedule.isActive ? "Active" : "Inactive"}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                              onClick={() =>
                                openDeleteDialog(courseSchedule._id)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Course List */}
                      <div className="p-4">
                        <div className="space-y-3">
                          {courseSchedule.courses &&
                          courseSchedule.courses.length > 0 ? (
                            courseSchedule.courses.map((course, index) => (
                              <div
                                key={index}
                                className="p-3 bg-slate-50/70 rounded-xl"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-medium text-foreground">
                                      {course.namaMataKuliah ||
                                        "Unnamed Course"}
                                    </h4>
                                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-foreground">
                                          Hari:
                                        </span>
                                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md text-xs font-medium">
                                          {DAYS.find(
                                            (d) => d.value === course.hari,
                                          )?.label || "-"}
                                        </span>
                                      </div>
                                      <p>
                                        <span className="font-medium text-foreground">
                                          Waktu:
                                        </span>{" "}
                                        {course.jamMulai || "-"} -{" "}
                                        {course.jamSelesai || "-"}
                                      </p>
                                      {course.ruangan && (
                                        <p>
                                          <span className="font-medium text-foreground">
                                            Ruangan:
                                          </span>{" "}
                                          {course.ruangan}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <EmptyState message="No courses available" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {meta && (
                <Pagination
                  meta={meta}
                  currentPage={page}
                  onPageChange={setPage}
                  className="pt-6 border-t"
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="animate-fade-in-up delay-3">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              Gunakan informasi jadwal kuliah ini untuk mengatur shift yang
              tidak bentrok dengan waktu kuliah mahasiswa.
            </p>
            <p>
              Jadwal kuliah yang Active adalah jadwal yang sedang berlaku untuk
              semester ini.
            </p>
            <p>
              Perhatikan hari dan jam kuliah saat membuat schedule shift untuk
              user.
            </p>
            <p>
              Hapus jadwal kuliah yang sudah tidak relevan atau sudah berakhir
              semesternya.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={handleDeleteDialogChange}
        title="Delete Course Schedule?"
        description="Are you sure you want to delete this course schedule? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
