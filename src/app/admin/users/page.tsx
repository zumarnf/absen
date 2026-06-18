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
import { formatDate } from "@/shared/lib/helpers";
import { EmptyState } from "@/shared/components/empty-state";
import { TableSkeleton } from "@/shared/components/table-skeleton";
import { useAdminUsersPage } from "@/features/users/hooks/use-admin-users-page";

const CreateUserDialog = dynamic(
  () =>
    import("@/features/users/components/create-user-dialog").then(
      (mod) => mod.CreateUserDialog,
    ),
  { ssr: false, loading: () => null },
);

const ConfirmDialog = dynamic(
  () =>
    import("@/shared/components/confirm-dialog").then(
      (mod) => mod.ConfirmDialog,
    ),
  { ssr: false, loading: () => null },
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UsersIcon
                  className="h-5 w-5 text-muted-foreground"
                  strokeWidth={1.75}
                />
                Manajemen Pengguna
              </CardTitle>
              <CardDescription>Kelola semua user dalam sistem.</CardDescription>
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
                Klik tombol Tambah User untuk menambahkan user baru.
              </p>
            </EmptyState>
          ) : (
            <>
              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Username</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Bergabung</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user._id} className="table-row-hover">
                        <TableCell className="font-medium">
                          <p className="font-medium text-foreground">
                            {user.username}
                          </p>
                          <p className="nums text-xs text-muted-foreground">
                            {user._id}
                          </p>
                        </TableCell>
                        <TableCell>{user.nama}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.role === "admin" ? "default" : "secondary"
                            }
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
                              size="icon-sm"
                              onClick={() => handleViewUser(user)}
                              aria-label="Lihat detail"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => handleDeleteClick(user)}
                              disabled={
                                user.role === "admin" ||
                                deleteMutation.isPending
                              }
                              aria-label="Hapus user"
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

              <div className="mt-4 flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3 text-sm">
                <span className="text-muted-foreground">Total pengguna</span>
                <span className="nums font-semibold text-foreground">
                  {users.length}
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="animate-fade-in-up delay-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Info className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
            Informasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Admin yang membuat akun untuk user (bukan self-registration).</li>
            <li>Username hanya boleh huruf kecil, angka, dan underscore.</li>
            <li>Password minimal 6 karakter.</li>
            <li>User baru otomatis bisa langsung login.</li>
            <li className="font-medium text-destructive">
              User dengan role admin tidak dapat dihapus.
            </li>
          </ul>
        </CardContent>
      </Card>

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
