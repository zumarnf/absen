"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useMySchedule } from "@/features/schedules/hooks/use-schedules";
import { useUsersForCoverage } from "@/features/users/hooks/use-users";
import { useAuthStore } from "@/features/auth/store";
import { flattenScheduleByDay } from "@/features/schedules/helpers";
import {
  useApproveCoverage,
  useCancelCoverage,
  useCreateCoverage,
  useIncomingCoverages,
  useOutgoingCoverages,
  useRejectCoverage,
} from "@/features/shift-coverage/hooks/use-shift-coverage";

interface FormState {
  open: boolean;
  targetUserId: string;
  /** ISO date YYYY-MM-DD */
  date: string;
  shift: number | null;
  pos: 1 | 2 | null;
  reason: string;
}

const INITIAL_FORM: FormState = {
  open: false,
  targetUserId: "",
  date: "",
  shift: null,
  pos: null,
  reason: "",
};

function todayIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function useUserCoveragePage() {
  const { user } = useAuthStore();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);

  const { data: incomingData, isLoading: loadingIncoming } =
    useIncomingCoverages();
  const { data: outgoingData, isLoading: loadingOutgoing } =
    useOutgoingCoverages();
  const { data: usersData } = useUsersForCoverage();
  const { data: mySchedule } = useMySchedule();

  const createMutation = useCreateCoverage();
  const approveMutation = useApproveCoverage();
  const rejectMutation = useRejectCoverage();
  const cancelMutation = useCancelCoverage();

  const incoming = incomingData?.data ?? [];
  const outgoing = outgoingData?.data ?? [];

  const otherUsers = useMemo(
    () =>
      (usersData?.data ?? []).filter(
        (u) => u._id !== user?._id && u.role !== "admin",
      ),
    [usersData, user],
  );

  /**
   * Shifts I have on the selected date's dayOfWeek, derived from my active
   * weekly schedule. Empty when no date picked or no shift that day.
   */
  const availableShifts = useMemo(() => {
    if (!form.date || !mySchedule?.data?.schedules) return [];
    const dayOfWeek = new Date(form.date).getDay();
    const byDay = flattenScheduleByDay(mySchedule.data.schedules);
    return (byDay[dayOfWeek] || []).sort((a, b) => a.shift - b.shift);
  }, [form.date, mySchedule]);

  const openForm = () =>
    setForm({ ...INITIAL_FORM, open: true, date: todayIso() });
  const closeForm = () => setForm(INITIAL_FORM);

  const setTargetUserId = (id: string) =>
    setForm((s) => ({ ...s, targetUserId: id }));
  const setDate = (date: string) =>
    setForm((s) => ({ ...s, date, shift: null, pos: null }));
  const setShiftPos = (shift: number, pos: 1 | 2) =>
    setForm((s) => ({ ...s, shift, pos }));
  const setReason = (reason: string) => setForm((s) => ({ ...s, reason }));

  const submit = () => {
    if (!form.targetUserId) {
      toast.error("Pilih user pengganti");
      return;
    }
    if (!form.date) {
      toast.error("Pilih tanggal");
      return;
    }
    if (form.shift === null || form.pos === null) {
      toast.error("Pilih shift yang ingin digantikan");
      return;
    }
    createMutation.mutate(
      {
        targetUserId: form.targetUserId,
        date: form.date,
        shift: form.shift,
        pos: form.pos,
        reason: form.reason || undefined,
      },
      { onSuccess: closeForm },
    );
  };

  return {
    incoming,
    outgoing,
    loadingIncoming,
    loadingOutgoing,
    otherUsers,
    availableShifts,
    form,
    openForm,
    closeForm,
    setTargetUserId,
    setDate,
    setShiftPos,
    setReason,
    submit,
    isPending: createMutation.isPending,
    approveMutation,
    rejectMutation,
    cancelMutation,
    minDate: todayIso(),
  };
}
