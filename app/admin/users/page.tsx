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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users as UsersIcon, Eye, Trash2, Info } from "lucide-react";
import dynamic from "next/dynamic";
import { formatDate } from "@/lib/helpers";
import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { useAdminUsersPage } from "@/hooks/pages/use-admin-users-page";

const CreateUserDialog = dynamic(
  () =>
    import("@/components/admin/create-user-dialog").then(
      (mod) => mod.CreateUserDialog
    ),
  { ssr: false, loading: () => null }
);

const ConfirmDialog = dynamic(
  () =>
    import("@/components/shared/confirm-dialog").then(
      (mod) => mod.ConfirmDialog
    ),
  { ssr: false, loading: () => null }
);

export default function AdminUsersPage() {
  const {
    users,
    isLoading,
    deleteDialog,
    deleteMutation,
    handleDeleteClick,
    handleDeleteDialogChange,
    handleDeleteConfirm,
    handleViewUser,
  } = useAdminUsersPage();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UsersIcon className="h-5 w-5 text-indigo-500" />
                User Management
              </CardTitle>
              <CardDescription>Kelola semua user dalam sistem</CardDescription>
            </div>
            <CreateUserDialog />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton columns={5} rows={6} showPagination={false} />
          ) : users.length === 0 ? (
            <EmptyState message="Belum ada user">
              <p className="text-sm text-muted-foreground">
                Klik tombol Create User untuk menambahkan user baru
              </p>
            </EmptyState>
          ) : (
            <>
              <div className="rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50">
                      <TableHead>Username</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Bergabung</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user._id} className="table-row-hover">
                        <TableCell className="font-medium">
                          <div>
                            <p className="font-medium text-foreground">
                              {user.username}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {user._id}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{user.nama}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.role === "admin" ? "default" : "secondary"
                            }
                            className="rounded-lg"
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(user.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewUser(user)}
                              className="rounded-lg hover:bg-solid-surface hover:text-solid-primary transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                              onClick={() => handleDeleteClick(user)}
                              disabled={
                                user.role === "admin" ||
                                deleteMutation.isPending
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <p className="text-sm text-indigo-900">
                  <strong>Total Users:</strong> {users.length}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="animate-fade-in-up delay-2">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="h-4 w-4 text-indigo-500" />
            User Management Info
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Admin yang membuat akun untuk user (bukan self-registration)</p>
            <p>Username hanya boleh huruf kecil, angka, dan underscore</p>
            <p>Password minimal 6 karakter</p>
            <p>
              User baru otomatis bisa langsung login dengan credentials yang
              dibuat
            </p>
            <p className="text-red-500 font-medium">
              User dengan role admin tidak dapat dihapus
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={handleDeleteDialogChange}
        title="Hapus User?"
        description={
          <>
            Apakah Anda yakin ingin menghapus user{" "}
            <strong>{deleteDialog.user?.nama}</strong> (@
            {deleteDialog.user?.username})? Tindakan ini tidak dapat dibatalkan
            dan akan menghapus semua data terkait user ini.
          </>
        }
        onConfirm={handleDeleteConfirm}
        isPending={deleteMutation.isPending}
        confirmText="Hapus"
        pendingText="Menghapus..."
        cancelText="Batal"
      />
    </div>
  );
}
