"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useUsersForSelect } from "@/features/users/hooks/use-users";
import { queryKeys } from "@/shared/lib/query-keys";
import {
  useAllSchedules,
  useCreateSchedule,
  useUpdateSchedule,
  useDeleteSchedule,
} from "@/features/schedules/hooks/use-schedules";
import { getUserInfo } from "@/shared/lib/helpers";
import {
  getShiftKey,
  convertToScheduleData,
  extractSelectionsFromSchedule,
} from "@/features/schedules/helpers";
import { findCourseConflicts } from "@/features/schedules/conflict-helpers";
import { useUserCourse } from "@/features/courses/hooks/use-courses";
import type { Course, Schedule } from "@/shared/types";

export function useAdminSchedulesPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [shiftPosSelections, setShiftPosSelections] = useState<
    Record<string, 1 | 2>
  >({});
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    scheduleId: string | null;
  }>({
    open: false,
    scheduleId: null,
  });

  const { data: schedulesData, isLoading } = useAllSchedules();
  const { data: usersData } = useUsersForSelect(queryKeys.users.forSchedule);
  const createMutation = useCreateSchedule();
  const updateMutation = useUpdateSchedule();
  const deleteMutation = useDeleteSchedule();

  // Fetch course schedule of the currently selected user for conflict detection
  const { data: userCourseData } = useUserCourse(selectedUserId);
  const userCourses: Course[] = userCourseData?.data?.courses ?? [];

  const getConflictsFor = (dayOfWeek: number, shift: number): Course[] =>
    findCourseConflicts(dayOfWeek, shift, userCourses);

  const handlePosChange = (dayOfWeek: number, shift: number, pos: 1 | 2) => {
    const key = getShiftKey(dayOfWeek, shift);
    setShiftPosSelections((prev) => {
      if (prev[key] === pos) {
        const newSelections = { ...prev };
        delete newSelections[key];
        return newSelections;
      }
      return { ...prev, [key]: pos };
    });
  };

  const getSelectedPos = (dayOfWeek: number, shift: number): 1 | 2 | null => {
    const key = getShiftKey(dayOfWeek, shift);
    return shiftPosSelections[key] || null;
  };

  const isShiftSelected = (dayOfWeek: number, shift: number): boolean => {
    const key = getShiftKey(dayOfWeek, shift);
    return key in shiftPosSelections;
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingSchedule(null);
    setSelectedUserId("");
    setShiftPosSelections({});
  };

  const handleSubmit = () => {
    const scheduleData = convertToScheduleData(shiftPosSelections);

    if (editingSchedule) {
      updateMutation.mutate(
        {
          id: editingSchedule._id,
          data: { schedules: scheduleData },
        },
        { onSuccess: () => resetForm() },
      );
    } else {
      if (!selectedUserId) {
        toast.error("Please select a user!");
        return;
      }
      if (scheduleData.length === 0) {
        toast.error("Please select at least one shift!");
        return;
      }

      createMutation.mutate(
        {
          userId: selectedUserId,
          schedules: scheduleData,
        },
        { onSuccess: () => resetForm() },
      );
    }
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setIsCreating(true);

    const user = getUserInfo(schedule.userId);
    if (user) {
      setSelectedUserId(user._id);
    }

    setShiftPosSelections(extractSelectionsFromSchedule(schedule));
  };

  const handleDeleteDialogChange = (open: boolean) => {
    setDeleteDialog({ open, scheduleId: null });
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.scheduleId) {
      deleteMutation.mutate(deleteDialog.scheduleId, {
        onSuccess: () => setDeleteDialog({ open: false, scheduleId: null }),
      });
    }
  };

  const schedules = schedulesData?.data || [];
  const users = usersData?.data || [];
  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  const selectedShiftsCount = Object.keys(shiftPosSelections).length;

  return {
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
  };
}
