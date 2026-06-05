import { Response } from "express";
import { AuthRequest } from "../types";
import eventBus from "../utils/eventBus";

const HEARTBEAT_INTERVAL_MS = 25_000;

const RELAY_EVENTS = [
  "attendance:created",
  "schedule:created",
  "schedule:updated",
  "schedule:deleted",
] as const;

/**
 * Server-Sent Events endpoint for admin dashboards.
 * Keeps connection open and forwards relevant domain events.
 */
export const subscribe = (req: AuthRequest, res: Response): void => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  const writeEvent = (event: string, payload: unknown) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  // Initial handshake
  writeEvent("ready", { ok: true, at: Date.now() });

  // Heartbeat to keep proxies from closing the idle connection
  const heartbeat = setInterval(() => {
    res.write(`: ping ${Date.now()}\n\n`);
  }, HEARTBEAT_INTERVAL_MS);

  const handlers = new Map<string, (payload: unknown) => void>();
  for (const event of RELAY_EVENTS) {
    const handler = (payload: unknown) => writeEvent(event, payload);
    handlers.set(event, handler);
    eventBus.on(event, handler);
  }

  const cleanup = () => {
    clearInterval(heartbeat);
    for (const [event, handler] of handlers.entries()) {
      eventBus.off(event, handler);
    }
  };

  req.on("close", cleanup);
  req.on("aborted", cleanup);
};
