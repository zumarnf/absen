"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";

type StreamStatus = "idle" | "connecting" | "open" | "closed" | "error";

function computeInitialStatus(enabled: boolean): StreamStatus {
  if (!enabled || typeof window === "undefined") return "idle";
  if (!("EventSource" in window)) return "error";
  if (!localStorage.getItem("token")) return "idle";
  return "connecting";
}

/**
 * Open an admin-only SSE connection and invalidate relevant React Query
 * caches when realtime events arrive. Auth token is appended as a query
 * param because EventSource cannot send custom headers.
 */
export function useRealtimeEvents(enabled = true) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<StreamStatus>(() =>
    computeInitialStatus(enabled),
  );
  const [lastEventAt, setLastEventAt] = useState<number | null>(null);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    if (!("EventSource" in window)) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const url = `${baseUrl}/stream/events?token=${encodeURIComponent(token)}`;

    const es = new EventSource(url, { withCredentials: true });

    es.addEventListener("ready", () => setStatus("open"));

    es.addEventListener("attendance:created", () => {
      setLastEventAt(Date.now());
      queryClient.invalidateQueries({
        queryKey: ["admin-all-attendance"],
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.stats,
      });
      toast.info("Check-in baru diterima", { duration: 2000 });
    });

    es.addEventListener("schedule:created", () => {
      setLastEventAt(Date.now());
      queryClient.invalidateQueries({ queryKey: queryKeys.schedules.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.schedules.grouped });
    });
    es.addEventListener("schedule:updated", () => {
      setLastEventAt(Date.now());
      queryClient.invalidateQueries({ queryKey: queryKeys.schedules.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.schedules.grouped });
    });
    es.addEventListener("schedule:deleted", () => {
      setLastEventAt(Date.now());
      queryClient.invalidateQueries({ queryKey: queryKeys.schedules.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.schedules.grouped });
    });

    es.onerror = () => {
      setStatus("error");
      // EventSource will auto-retry; no manual reconnect needed.
    };

    return () => {
      es.close();
      setStatus("closed");
    };
  }, [enabled, queryClient]);

  return { status, lastEventAt };
}
