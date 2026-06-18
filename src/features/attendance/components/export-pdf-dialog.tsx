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
import { ButtonLoader } from "@/shared/components/loader";
import type { User } from "@/shared/types";
import type { UserAttendanceResponse } from "@/shared/types";

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
            <FileText
              className="h-5 w-5 text-muted-foreground"
              strokeWidth={1.75}
            />
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
              <SelectTrigger className="w-full">
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
            <div className="animate-fade-in-up rounded-lg border bg-muted/50 p-4">
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
            className="w-full"
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
