import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import type { Application } from "express";
import { createApp } from "../app";
import { seedUser, loginCookie, authHeaders } from "./helpers";
import Schedule from "../models/Schedule";
import CourseSchedule from "../models/CourseSchedule";
import ShiftCoverage from "../models/ShiftCoverage";

let app: Application;

beforeAll(() => {
  app = createApp();
});

describe("Schedule access control (GET /api/schedules/user/:userId)", () => {
  it("lets a user read their own schedule", async () => {
    const user = await seedUser({ username: "owner1" });
    await Schedule.create({
      userId: user.id,
      schedules: [{ dayOfWeek: 1, shifts: [1, 2], pos: 1 }],
      isActive: true,
    });
    const cookie = await loginCookie(app, user.username, user.password);

    const res = await request(app)
      .get(`/api/schedules/user/${user.id}`)
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
  });

  it("forbids a user from reading another user's schedule (IDOR)", async () => {
    const victim = await seedUser({ username: "victim1" });
    const attacker = await seedUser({ username: "attacker1" });
    await Schedule.create({
      userId: victim.id,
      schedules: [{ dayOfWeek: 1, shifts: [1], pos: 1 }],
      isActive: true,
    });
    const cookie = await loginCookie(app, attacker.username, attacker.password);

    const res = await request(app)
      .get(`/api/schedules/user/${victim.id}`)
      .set("Cookie", cookie);

    expect(res.status).toBe(403);
  });

  it("lets an admin read any user's schedule", async () => {
    const victim = await seedUser({ username: "victim2" });
    const admin = await seedUser({ username: "admin2", role: "admin" });
    await Schedule.create({
      userId: victim.id,
      schedules: [{ dayOfWeek: 2, shifts: [3], pos: 2 }],
      isActive: true,
    });
    const cookie = await loginCookie(app, admin.username, admin.password);

    const res = await request(app)
      .get(`/api/schedules/user/${victim.id}`)
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
  });
});

describe("Course schedule ownership (PUT /api/courses/:id)", () => {
  it("forbids updating a course schedule owned by another user (IDOR)", async () => {
    const owner = await seedUser({ username: "cowner" });
    const attacker = await seedUser({ username: "cattacker" });
    const course = await CourseSchedule.create({
      userId: owner.id,
      courses: [
        { namaMataKuliah: "Algo", hari: 1, jamMulai: "08:00", jamSelesai: "10:00" },
      ],
      semester: "Ganjil",
      tahunAjaran: "2025/2026",
      isActive: true,
    });
    const cookie = await loginCookie(app, attacker.username, attacker.password);

    const res = await request(app)
      .put(`/api/courses/${course._id.toString()}`)
      .set("Cookie", cookie)
      .send({ semester: "Genap" });

    expect(res.status).toBe(403);
  });
});

describe("Shift coverage authorization (POST /api/shift-coverages/:id/approve)", () => {
  it("only the target user can approve a coverage request", async () => {
    const requester = await seedUser({ username: "req1" });
    const target = await seedUser({ username: "tgt1" });
    const outsider = await seedUser({ username: "out1" });

    const coverage = await ShiftCoverage.create({
      requesterId: requester.id,
      targetUserId: target.id,
      date: new Date(),
      shift: 1,
      pos: 1,
      status: "pending",
    });

    const outsiderHeaders = await authHeaders(app, outsider.username, outsider.password);
    const denied = await request(app)
      .post(`/api/shift-coverages/${coverage._id.toString()}/approve`)
      .set(outsiderHeaders);
    expect(denied.status).toBe(403);

    const targetHeaders = await authHeaders(app, target.username, target.password);
    const approved = await request(app)
      .post(`/api/shift-coverages/${coverage._id.toString()}/approve`)
      .set(targetHeaders);
    expect(approved.status).toBe(200);
    expect(approved.body.data.status).toBe("approved");
  });
});

describe("Admin-only endpoints reject regular users", () => {
  it("GET /api/users/all -> 403 for a non-admin", async () => {
    const user = await seedUser({ username: "plainuser" });
    const cookie = await loginCookie(app, user.username, user.password);

    const res = await request(app).get("/api/users/all").set("Cookie", cookie);
    expect(res.status).toBe(403);
  });

  it("GET /api/attendance/all -> 403 for a non-admin", async () => {
    const user = await seedUser({ username: "plainuser2" });
    const cookie = await loginCookie(app, user.username, user.password);

    const res = await request(app)
      .get("/api/attendance/all")
      .set("Cookie", cookie);
    expect(res.status).toBe(403);
  });
});
