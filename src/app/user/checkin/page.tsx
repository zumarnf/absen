"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, MapPin, Clock } from "lucide-react";
import { SHIFTS_WITH_TIME } from "@/shared/lib/constants";
import { ButtonLoader } from "@/shared/components/loader";
import { useUserCheckinPage } from "@/features/attendance/hooks/use-user-checkin-page";

export default function CheckinPage() {
  const {
    selectedShifts,
    checkinMutation,
    handlePosSelect,
    getSelectedPos,
    handleSubmit,
    totalHours,
    getSelectedSummary,
  } = useUserCheckinPage();

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <Card className="animate-fade-in-up">
        <CardHeader>
          <CardTitle className="text-lg font-black">Informasi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Setiap shift berdurasi 5 jam kerja</p>
            <p>Pilih shift dan pos yang akan Anda kerjakan</p>
            <p>Anda bisa memilih lebih dari 1 shift dalam sehari</p>
            <p>Check-in hanya bisa dilakukan sekali per hari</p>
          </div>
        </CardContent>
      </Card>

      {/* Legend Card */}
      <Card className="animate-fade-in-up delay-1">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            Keterangan Pos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-[#edf3ec] rounded-lg border border-[#d6e4d5]">
              <div className="w-4 h-4 rounded-md bg-[#edf3ec]0"></div>
              <div>
                <p className="font-medium text-[#346538]">Pos 1</p>
                <p className="text-xs text-[#346538]">Lokasi pos pertama</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-[#e8f0fb] rounded-lg border border-[#d3e1f3]">
              <div className="w-4 h-4 rounded-md bg-[#e8f0fb]0"></div>
              <div>
                <p className="font-medium text-[#1f5c93]">Pos 2</p>
                <p className="text-xs text-[#1f5c93]">Lokasi pos kedua</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Checkin Card */}
      <Card className="animate-fade-in-up delay-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-muted-foreground" />
            Check-in Shift
          </CardTitle>
          <CardDescription>
            Pilih shift dan pos yang akan Anda kerjakan hari ini
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Shift Selection */}
          <div className="space-y-3">
            {SHIFTS_WITH_TIME.map((shift) => {
              const selectedPos = getSelectedPos(shift.value);
              const isSelected = selectedPos !== null;

              return (
                <div
                  key={shift.value}
                  className={`rounded-lg border p-4 transition-colors ${
                    isSelected
                      ? "border-foreground bg-muted/60"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">
                          {shift.label}
                        </p>
                        {isSelected && (
                          <span
                            className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                              selectedPos === 1
                                ? "bg-[#edf3ec] text-[#346538]"
                                : "bg-[#e8f0fb] text-[#1f5c93]"
                            }`}
                          >
                            Pos {selectedPos}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <Clock className="h-3 w-3" />
                        <span>{shift.time}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={selectedPos === 1 ? "default" : "outline"}
                        className={`w-16 rounded-lg transition-all duration-200 ${
                          selectedPos === 1
                            ? "bg-[#346538] hover:bg-[#2b5430]"
                            : "hover:bg-[#edf3ec] hover:text-[#346538] hover:border-[#d6e4d5]"
                        }`}
                        onClick={() => handlePosSelect(shift.value, 1)}
                      >
                        Pos 1
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={selectedPos === 2 ? "default" : "outline"}
                        className={`w-16 rounded-lg transition-all duration-200 ${
                          selectedPos === 2
                            ? "bg-[#1f5c93] hover:bg-[#1a4f7d]"
                            : "hover:bg-[#e8f0fb] hover:text-[#1f5c93] hover:border-[#d3e1f3]"
                        }`}
                        onClick={() => handlePosSelect(shift.value, 2)}
                      >
                        Pos 2
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          {selectedShifts.size > 0 && (
            <div className="p-4 bg-muted/50 rounded-lg border border animate-fade-in-up">
              <p className="text-sm font-medium text-foreground mb-2">
                Ringkasan Check-in:
              </p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex flex-wrap gap-2">
                  {getSelectedSummary().map((item, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-muted rounded-lg text-xs font-medium"
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <p className="mt-2 pt-2 border-t border">
                  Total jam kerja: <strong>{totalHours} jam</strong>
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={selectedShifts.size === 0 || checkinMutation.isPending}
            className="w-full h-11 rounded-lg font-medium"
          >
            {checkinMutation.isPending ? (
              <ButtonLoader message="Processing..." />
            ) : (
              "Konfirmasi Check-in"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
