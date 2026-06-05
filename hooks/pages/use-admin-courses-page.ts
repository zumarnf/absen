"use client";

import { useState } from "react";
import { useQueryState, parseAsInteger } from "nuqs";
import { useAllCourses, useDeleteCourse } from "@/hooks/use-courses";

export function useAdminCoursesPage() {
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: true }),
  );
  const limit = 10;
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    courseId: string | null;
  }>({
    open: false,
    courseId: null,
  });

  const { data, isLoading } = useAllCourses(page, limit);
  const deleteMutation = useDeleteCourse();

  const courses = data?.data || [];
  const meta = data?.meta;

  const handleDeleteDialogChange = (open: boolean) => {
    setDeleteDialog({ open, courseId: null });
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.courseId) {
      deleteMutation.mutate(deleteDialog.courseId, {
        onSuccess: () => setDeleteDialog({ open: false, courseId: null }),
      });
    }
  };

  const openDeleteDialog = (courseId: string) => {
    setDeleteDialog({ open: true, courseId });
  };

  return {
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
  };
}
