import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import type { Application } from "express";
import { createApp } from "../app";
import { seedUser, authHeaders } from "./helpers";

let app: Application;

beforeAll(() => {
  app = createApp();
});

describe("POST /api/schedules — shift capacity (max 3 per shift/pos)", () => {
  it("allows up to 3 workers on the same day/shift/pos and rejects the 4th", async () => {
    const admin = await seedUser({ username: "capadmin", role: "admin" });
    const headers = await authHeaders(app, admin.username, admin.password);

    const slot = { dayOfWeek: 1, shifts: [1], pos: 1 };

    // First three workers fill the slot.
    for (let i = 0; i < 3; i++) {
      const worker = await seedUser({ username: `capworker${i}` });
      const res = await request(app)
        .post("/api/schedules")
        .set(headers)
        .send({ userId: worker.id, schedules: [slot] });
      expect(res.status).toBe(201);
    }

    // The fourth worker on the same slot must be rejected as full.
    const overflow = await seedUser({ username: "capoverflow" });
    const res = await request(app)
      .post("/api/schedules")
      .set(headers)
      .send({ userId: overflow.id, schedules: [slot] });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/penuh/i);
  });

  it("rejects a non-admin trying to create a schedule", async () => {
    const user = await seedUser({ username: "notadmin" });
    const target = await seedUser({ username: "sometarget" });
    const headers = await authHeaders(app, user.username, user.password);

    const res = await request(app)
      .post("/api/schedules")
      .set(headers)
      .send({
        userId: target.id,
        schedules: [{ dayOfWeek: 2, shifts: [3], pos: 2 }],
      });

    expect(res.status).toBe(403);
  });
});
