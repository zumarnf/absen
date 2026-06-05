"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { HandHelping, Plus, X, Check, Clock, Calendar } from "lucide-react";
import { ButtonLoader } from "@/components/shared/loader";
import { EmptyState } from "@/components/shared/empty-state";
import { CardListSkeleton } from "@/components/shared/card-list-skeleton";
import { formatDateLong } from "@/lib/helpers";
import { useUserCoveragePage } from "@/hooks/pages/use-user-coverage-page";
import type {
  ShiftCoverage,
  ShiftCoverageStatus,
} from "@/types/shift-coverage";
import type { UserInfo } from "@/types/user";

function userLabel(value: ShiftCoverage["requesterId"]): string {
  if (typeof value === "string") return value;
  const u = value as UserInfo;
  return `${u.nama} (@${u.username})`;
}

const STATUS_BADGE: Record<
  ShiftCoverageStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-amber-100 text-amber-800 border border-amber-200",
  },
  approved: {
    label: "Approved",
    className: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-700 border border-red-200",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-slate-100 text-slate-600 border border-slate-200",
  },
};

export default function CoverageRequestsPage() {
  const {
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
    isPending,
    approveMutation,
    rejectMutation,
    cancelMutation,
    minDate,
  } = useUserCoveragePage();

  const renderCoverageCard = (
    coverage: ShiftCoverage,
    kind: "incoming" | "outgoing",
  ) => {
    const other =
      kind === "incoming" ? coverage.requesterId : coverage.targetUserId;
    const badge = STATUS_BADGE[coverage.status];

    return (
      <div
        key={coverage._id}
        className="p-4 border border-border/60 rounded-xl space-y-3 card-hover"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">
              {kind === "incoming"
                ? "Diminta gantikan oleh"
                : "Meminta dibantu oleh"}
            </p>
            <p className="font-medium text-foreground">{userLabel(other)}</p>
          </div>
          <span
            className={`px-2.5 py-1 rounded-lg text-xs font-medium ${badge.className}`}
          >
            {badge.label}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-sm">
          <div className="flex items-center gap-1.5 text-indigo-700 text-xs font-medium mb-1">
            <Calendar className="h-3.5 w-3.5" />
            {formatDateLong(coverage.date)}
          </div>
          <p className="text-indigo-900 font-medium">
            Shift {coverage.shift} • Pos {coverage.pos}
          </p>
        </div>

        {coverage.reason && (
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">Alasan: </span>
            {coverage.reason}
          </div>
        )}

        {coverage.status === "pending" && (
          <div className="flex justify-end gap-2 pt-1">
            {kind === "incoming" ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600"
                  disabled={rejectMutation.isPending}
                  onClick={() => rejectMutation.mutate(coverage._id)}
                >
                  <X className="h-4 w-4 mr-1" /> Tolak
                </Button>
                <Button
                  size="sm"
                  className="rounded-lg bg-emerald-500 hover:bg-emerald-600"
                  disabled={approveMutation.isPending}
                  onClick={() => approveMutation.mutate(coverage._id)}
                >
                  <Check className="h-4 w-4 mr-1" /> Terima
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="rounded-lg"
                disabled={cancelMutation.isPending}
                onClick={() => cancelMutation.mutate(coverage._id)}
              >
                <X className="h-4 w-4 mr-1" /> Batalkan
              </Button>
            )}
          </div>
        )}

        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {new Date(coverage.createdAt).toLocaleString("id-ID")}
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <HandHelping className="h-5 w-5 text-indigo-500" />
                Pengganti Shift
              </CardTitle>
              <CardDescription>
                Minta user lain menggantikan shift Anda di tanggal tertentu.
                Attendance akan tercatat atas nama user pengganti.
              </CardDescription>
            </div>
            {!form.open && (
              <Button onClick={openForm} className="rounded-xl">
                <Plus className="h-4 w-4 mr-2" />
                Permintaan Baru
              </Button>
            )}
          </div>
        </CardHeader>
        {form.open && (
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                User Pengganti
              </label>
              <Select
                value={form.targetUserId}
                onValueChange={setTargetUserId}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Pilih user yang menggantikan" />
                </SelectTrigger>
                <SelectContent>
                  {otherUsers.map((u) => (
                    <SelectItem key={u._id} value={u._id}>
                      {u.nama} (@{u.username})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Tanggal</label>
              <Input
                type="date"
                value={form.date}
                min={minDate}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Shift Anda yang Digantikan
              </label>
              {!form.date ? (
                <p className="text-sm text-muted-foreground">
                  Pilih tanggal terlebih dahulu
                </p>
              ) : availableShifts.length === 0 ? (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
                  Anda tidak punya jadwal shift di tanggal tersebut.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {availableShifts.map(({ shift, pos }) => {
                    const isSelected =
                      form.shift === shift && form.pos === pos;
                    return (
                      <button
                        key={`${shift}-${pos}`}
                        type="button"
                        onClick={() => setShiftPos(shift, pos)}
                        className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                          isSelected
                            ? pos === 1
                              ? "bg-emerald-500 text-white border-emerald-500"
                              : "bg-violet-500 text-white border-violet-500"
                            : "bg-white text-foreground border-border hover:bg-slate-50"
                        }`}
                      >
                        Shift {shift} • Pos {pos}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Alasan (opsional)
              </label>
              <textarea
                value={form.reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                maxLength={500}
                className="w-full rounded-xl border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="Jelaskan singkat alasan butuh pengganti..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={closeForm}
                className="rounded-xl"
              >
                Batal
              </Button>
              <Button
                onClick={submit}
                disabled={isPending}
                className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700"
              >
                {isPending ? (
                  <ButtonLoader message="Mengirim..." />
                ) : (
                  "Kirim Permintaan"
                )}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      <Tabs defaultValue="incoming">
        <TabsList className="grid w-full grid-cols-2 rounded-xl p-1">
          <TabsTrigger value="incoming" className="rounded-lg">
            Diminta Bantu{" "}
            {incoming.filter((s) => s.status === "pending").length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {incoming.filter((s) => s.status === "pending").length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="outgoing" className="rounded-lg">
            Permintaan Saya
          </TabsTrigger>
        </TabsList>

        <TabsContent value="incoming" className="space-y-3 mt-4">
          {loadingIncoming ? (
            <CardListSkeleton count={2} innerRows={1} />
          ) : incoming.length === 0 ? (
            <EmptyState message="Belum ada permintaan dari user lain" />
          ) : (
            incoming.map((c) => renderCoverageCard(c, "incoming"))
          )}
        </TabsContent>

        <TabsContent value="outgoing" className="space-y-3 mt-4">
          {loadingOutgoing ? (
            <CardListSkeleton count={2} innerRows={1} />
          ) : outgoing.length === 0 ? (
            <EmptyState message="Belum ada permintaan yang Anda kirim" />
          ) : (
            outgoing.map((c) => renderCoverageCard(c, "outgoing"))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
