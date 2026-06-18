"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useUsers, useDeleteUser } from "@/features/users/hooks/use-users";
import type { User } from "@/shared/types";

export function useAdminUsersPage() {
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    user: User | null;
  }>({
    open: false,
    user: null,
  });

  const { data, isLoading } = useUsers();
  const deleteMutation = useDeleteUser();

  const users = data?.data || [];

  const handleDeleteClick = (user: User) => {
    if (user.role === "admin") {
      toast.error("Tidak dapat menghapus admin!");
      return;
    }
    setDeleteDialog({ open: true, user });
  };

  const handleDeleteDialogChange = (open: boolean) => {
    if (!open) setDeleteDialog({ open: false, user: null });
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.user) {
      deleteMutation.mutate(deleteDialog.user._id, {
        onSuccess: () => setDeleteDialog({ open: false, user: null }),
      });
    }
  };

  const handleViewUser = (user: User) => {
    toast.info(`Detail user: ${user.nama}`, {
      description: `Username: ${user.username}\nRole: ${user.role}`,
    });
  };

  return {
    users,
    isLoading,
    deleteDialog,
    deleteMutation,
    handleDeleteClick,
    handleDeleteDialogChange,
    handleDeleteConfirm,
    handleViewUser,
  };
}
