import { EventEmitter } from "events";

/**
 * Singleton EventEmitter used to broadcast realtime events
 * across the process (e.g., attendance:created -> SSE subscribers).
 *
 * Note: this is single-process only. For multi-instance deployments,
 * replace with Redis pub/sub or similar shared bus.
 */
class AppEventBus extends EventEmitter {}

const eventBus = new AppEventBus();
eventBus.setMaxListeners(100); // allow many concurrent SSE clients

export default eventBus;
