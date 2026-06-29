import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import type { Application } from "express";
import { createApp } from "../app";
import { seedUser, loginCookie, authHeaders } from "./helpers";

let app: Application;

beforeAll(() => {
  app = createApp();
});

describe("CSRF double-submit protection", () => {
  it("login issues a readable (non-httpOnly) csrf-token cookie", async () => {
    await seedUser({ username: "csrfuser", password: "password123" });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: "csrfuser", password: "password123" });

    const cookies = res.headers["set-cookie"] as unknown as string[];
    const csrfCookie = cookies.find((c) => c.startsWith("csrf-token="));
    expect(csrfCookie).toBeDefined();
    // Must be readable by JS so the SPA can echo it in the header.
    expect(csrfCookie).not.toMatch(/HttpOnly/i);
  });

  it("rejects an authenticated state-changing request without the CSRF header", async () => {
    const user = await seedUser({ username: "csrfnoheader" });
    // Cookies only (auth + csrf) but no X-CSRF-Token header.
    const cookies = await loginCookie(app, user.username, user.password);

    const res = await request(app)
      .post("/api/attendance/checkin")
      .set("Cookie", cookies)
      .send({ shifts: [{ shift: 1, pos: 1 }] });

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/csrf/i);
  });

  it("allows the same request when the matching CSRF header is sent", async () => {
    const user = await seedUser({ username: "csrfwithheader" });
    const headers = await authHeaders(app, user.username, user.password);

    const res = await request(app)
      .post("/api/attendance/checkin")
      .set(headers)
      .send({ shifts: [{ shift: 1, pos: 1 }] });

    expect(res.status).toBe(201);
  });

  it("does not require a CSRF header for safe GET requests", async () => {
    const user = await seedUser({ username: "csrfget" });
    const cookies = await loginCookie(app, user.username, user.password);

    const res = await request(app)
      .get("/api/auth/profile")
      .set("Cookie", cookies);

    expect(res.status).toBe(200);
  });
});
