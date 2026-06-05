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
import { SHIFTS_WITH_TIME } from "@/lib/constants";
import { ButtonLoader } from "@/components/shared/loader";
import { useUserCheckinPage } from "@/hooks/pages/use-user-checkin-page";

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
            <MapPin className="h-4 w-4 text-indigo-500" />
            Keterangan Pos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="w-4 h-4 rounded-md bg-emerald-500"></div>
              <div>
                <p className="font-medium text-emerald-900">Pos 1</p>
                <p className="text-xs text-emerald-700">Lokasi pos pertama</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-violet-50 rounded-xl border border-violet-200">
              <div className="w-4 h-4 rounded-md bg-violet-500"></div>
              <div>
                <p className="font-medium text-violet-900">Pos 2</p>
                <p className="text-xs text-violet-700">Lokasi pos kedua</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Checkin Card */}
      <Card className="animate-fade-in-up delay-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-indigo-500" />
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
                  className={`p-4 border rounded-xl transition-all duration-200 ${
                    isSelected
                      ? "border-indigo-300 bg-indigo-50/60 shadow-sm"
                      : "hover:bg-slate-50 hover:shadow-sm"
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
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-violet-100 text-violet-700"
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
                            ? "bg-emerald-500 hover:bg-emerald-600"
                            : "hover:bg-emerald-100 hover:text-emerald-700 hover:border-emerald-300"
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
                            ? "bg-violet-500 hover:bg-violet-600"
                            : "hover:bg-violet-100 hover:text-violet-700 hover:border-violet-300"
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
            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 animate-fade-in-up">
              <p className="text-sm font-medium text-indigo-900 mb-2">
                Ringkasan Check-in:
              </p>
              <div className="space-y-1 text-sm text-indigo-700">
                <div className="flex flex-wrap gap-2">
                  {getSelectedSummary().map((item, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-indigo-100 rounded-lg text-xs font-medium"
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <p className="mt-2 pt-2 border-t border-indigo-200">
                  Total jam kerja: <strong>{totalHours} jam</strong>
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={selectedShifts.size === 0 || checkinMutation.isPending}
            className="w-full h-11 rounded-xl bg-solid-primary hover:bg-solid-dark text-white font-medium transition-all duration-200 hover:shadow-lg hover:shadow-solid-primary/25"
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
