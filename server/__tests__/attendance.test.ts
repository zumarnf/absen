import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import type { Application } from "express";
import { createApp } from "../app";
import { seedUser, loginCookie } from "./helpers";

let app: Application;

beforeAll(() => {
  app = createApp();
});

describe("POST /api/attendance/checkin", () => {
  it("requires authentication", async () => {
    const res = await request(app)
      .post("/api/attendance/checkin")
      .send({ shifts: [{ shift: 1, pos: 1 }] });

    expect(res.status).toBe(401);
  });

  it("checks in with valid shifts and computes totalHours", async () => {
    const user = await seedUser({ username: "checkin1" });
    const cookie = await loginCookie(app, user.username, user.password);

    const res = await request(app)
      .post("/api/attendance/checkin")
      .set("Cookie", cookie)
      .send({ shifts: [{ shift: 1, pos: 1 }] });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    // Default SHIFT_DURATION is 5 hours per shift (pre-save hook).
    expect(res.body.data.totalHours).toBe(5);
  });

  it("rejects a second check-in on the same day", async () => {
    const user = await seedUser({ username: "checkin2" });
    const cookie = await loginCookie(app, user.username, user.password);
    const body = { shifts: [{ shift: 2, pos: 1 }] };

    const first = await request(app)
      .post("/api/attendance/checkin")
      .set("Cookie", cookie)
      .send(body);
    expect(first.status).toBe(201);

    const second = await request(app)
      .post("/api/attendance/checkin")
      .set("Cookie", cookie)
      .send(body);
    expect(second.status).toBe(400);
    expect(second.body.message).toMatch(/already checked in/i);
  });

  it("rejects an out-of-range shift", async () => {
    const user = await seedUser({ username: "checkin3" });
    const cookie = await loginCookie(app, user.username, user.password);

    const res = await request(app)
      .post("/api/attendance/checkin")
      .set("Cookie", cookie)
      .send({ shifts: [{ shift: 9, pos: 1 }] });

    expect(res.status).toBe(400);
  });

  it("rejects an empty shifts array", async () => {
    const user = await seedUser({ username: "checkin4" });
    const cookie = await loginCookie(app, user.username, user.password);

    const res = await request(app)
      .post("/api/attendance/checkin")
      .set("Cookie", cookie)
      .send({ shifts: [] });

    expect(res.status).toBe(400);
  });
});
