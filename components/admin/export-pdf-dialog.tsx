"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, FileText } from "lucide-react";
import { ButtonLoader } from "@/components/shared/loader";
import type { User } from "@/types";
import type { UserAttendanceResponse } from "@/types";

interface ExportPdfDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: User[];
  exportUserId: string;
  setExportUserId: (id: string) => void;
  exportUser: User | undefined;
  exportAttendanceData: UserAttendanceResponse | undefined;
  isLoadingExport: boolean;
  isGeneratingPDF: boolean;
  getCurrentPeriod: () => string;
  handleGeneratePDF: () => void;
}

export function ExportPdfDialog({
  open,
  onOpenChange,
  users,
  exportUserId,
  setExportUserId,
  exportUser,
  exportAttendanceData,
  isLoadingExport,
  isGeneratingPDF,
  getCurrentPeriod,
  handleGeneratePDF,
}: ExportPdfDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-500" />
            Export Presensi PDF
          </DialogTitle>
          <DialogDescription>
            Pilih user untuk export data presensi ke PDF
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Pilih User</label>
            <Select value={exportUserId} onValueChange={setExportUserId}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Pilih user..." />
              </SelectTrigger>
              <SelectContent>
                {users
                  .filter((u) => u.role === "user")
                  .map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.nama} (@{user.username})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {exportUserId && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 animate-fade-in-up">
              <p className="text-sm text-muted-foreground mb-2">
                <strong className="text-foreground">User:</strong>{" "}
                {exportUser?.nama}
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                <strong className="text-foreground">Periode:</strong>{" "}
                {getCurrentPeriod()}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Total Data:</strong>{" "}
                {isLoadingExport
                  ? "Loading..."
                  : `${
                      exportAttendanceData?.data?.attendances?.length || 0
                    } record`}
              </p>
            </div>
          )}

          <Button
            className="w-full rounded-xl bg-solid-primary hover:bg-solid-dark text-white transition-all duration-200 hover:shadow-lg hover:shadow-solid-primary/25"
            onClick={handleGeneratePDF}
            disabled={
              !exportUserId ||
              isLoadingExport ||
              isGeneratingPDF ||
              !exportAttendanceData?.data?.attendances?.length
            }
          >
            {isGeneratingPDF ? (
              <ButtonLoader message="Generating PDF..." />
            ) : isLoadingExport ? (
              <ButtonLoader message="Loading data..." />
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
