"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useCheckin } from "@/features/attendance/hooks/use-attendance";
import type { ShiftAttendance } from "@/shared/types";

export function useUserCheckinPage() {
  const [selectedShifts, setSelectedShifts] = useState<Map<number, 1 | 2>>(
    new Map(),
  );

  const checkinMutation = useCheckin();

  const handlePosSelect = (shiftValue: number, pos: 1 | 2) => {
    setSelectedShifts((prev) => {
      const newMap = new Map(prev);
      const currentPos = newMap.get(shiftValue);

      if (currentPos === pos) {
        newMap.delete(shiftValue);
      } else {
        newMap.set(shiftValue, pos);
      }

      return newMap;
    });
  };

  const getSelectedPos = (shiftValue: number): 1 | 2 | null => {
    return selectedShifts.get(shiftValue) || null;
  };

  const handleSubmit = () => {
    if (selectedShifts.size === 0) {
      toast.error("Pilih minimal 1 shift!");
      return;
    }

    const shiftsArray: ShiftAttendance[] = Array.from(
      selectedShifts.entries(),
    ).map(([shift, pos]) => ({ shift, pos }));

    checkinMutation.mutate(
      { shifts: shiftsArray },
      {
        onSuccess: () => setSelectedShifts(new Map()),
      },
    );
  };

  const totalHours = selectedShifts.size * 5;

  const getSelectedSummary = () => {
    const items: string[] = [];
    const sortedShifts = Array.from(selectedShifts.entries()).sort(
      (a, b) => a[0] - b[0],
    );
    sortedShifts.forEach(([shift, pos]) => {
      items.push(`Shift ${shift} (Pos ${pos})`);
    });
    return items;
  };

  return {
    selectedShifts,
    checkinMutation,
    handlePosSelect,
    getSelectedPos,
    handleSubmit,
    totalHours,
    getSelectedSummary,
  };
}
