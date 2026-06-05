"use client";

import { useState } from "react";
import { useQueryStates, parseAsInteger, parseAsString } from "nuqs";
import { useUsersForSelect } from "@/hooks/use-users";
import {
  useAllAttendance,
  useUserAttendance,
  useExportAttendance,
} from "@/hooks/use-attendance";
import { generateAttendancePDF } from "@/lib/pdf-generator";

export function useAdminAttendancePage() {
  const [{ page, userId: selectedUserId }, setFilters] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      userId: parseAsString.withDefault(""),
    },
    { shallow: true },
  );
  const setPage = (value: number) => setFilters({ page: value });
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportUserId, setExportUserId] = useState<string>("");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const limit = 20;

  const { data: usersData } = useUsersForSelect();
  const { data: allAttendanceData, isLoading: isLoadingAll } = useAllAttendance(
    page,
    limit,
    !selectedUserId,
  );
  const { data: userAttendanceData, isLoading: isLoadingUser } =
    useUserAttendance(selectedUserId, page, limit, !!selectedUserId);
  const { data: exportAttendanceData, isLoading: isLoadingExport } =
    useExportAttendance(exportUserId, !!exportUserId && exportDialogOpen);

  const users = usersData?.data || [];
  const isLoading = selectedUserId ? isLoadingUser : isLoadingAll;

  const attendances = selectedUserId
    ? userAttendanceData?.data?.attendances || []
    : allAttendanceData?.data || [];

  const meta = selectedUserId
    ? userAttendanceData?.meta
    : allAttendanceData?.meta;

  const selectedUser = users.find((u) => u._id === selectedUserId);
  const exportUser = users.find((u) => u._id === exportUserId);

  const handleUserFilter = (userId: string) => {
    setFilters({ userId, page: 1 });
  };

  const clearFilter = () => {
    setFilters({ userId: "", page: 1 });
  };

  const getCurrentPeriod = () => {
    const now = new Date();
    const month = now.toLocaleDateString("id-ID", { month: "long" });
    const year = now.getFullYear();
    return `${month} ${year}`;
  };

  const handleGeneratePDF = async () => {
    if (!exportAttendanceData?.data?.attendances || !exportUser) return;

    setIsGeneratingPDF(true);
    try {
      await generateAttendancePDF({
        attendances: exportAttendanceData.data.attendances,
        user: exportUser,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return {
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
  };
}
