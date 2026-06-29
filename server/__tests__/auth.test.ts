import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import type { Application } from "express";
import { createApp } from "../app";
import { seedUser, loginCookie } from "./helpers";

let app: Application;

beforeAll(() => {
  app = createApp();
});

describe("POST /api/auth/login", () => {
  it("logs in with valid credentials and sets an httpOnly token cookie", async () => {
    await seedUser({ username: "alice", password: "password123" });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: "alice", password: "password123" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.username).toBe("alice");
    // Secret must never leak to the client.
    expect(res.body.data.user.password).toBeUndefined();

    const cookies = res.headers["set-cookie"] as unknown as string[];
    const tokenCookie = cookies.find((c) => c.startsWith("token="));
    expect(tokenCookie).toBeDefined();
    expect(tokenCookie).toMatch(/HttpOnly/i);
  });

  it("rejects an invalid password with 401 and a generic message", async () => {
    await seedUser({ username: "bob", password: "password123" });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: "bob", password: "wrong-password" });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid credentials");
  });

  it("returns 400 when fields are missing", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: "bob" });

    expect(res.status).toBe(400);
  });

  it("does not allow a NoSQL operator object as username", async () => {
    await seedUser({ username: "carol", password: "password123" });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: { $ne: null }, password: { $ne: null } });

    // typeof check rejects non-string credentials before they reach the query.
    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/register (admin-only)", () => {
  it("rejects unauthenticated requests with 401", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ username: "newuser", password: "password123", nama: "New" });

    expect(res.status).toBe(401);
  });

  it("rejects a non-admin caller with 403 (no privilege escalation)", async () => {
    const user = await seedUser({ username: "regular", role: "user" });
    const cookie = await loginCookie(app, user.username, user.password);

    const res = await request(app)
      .post("/api/auth/register")
      .set("Cookie", cookie)
      .send({
        username: "escalated",
        password: "password123",
        nama: "Escalated",
        role: "admin",
      });

    expect(res.status).toBe(403);
  });

  it("allows an admin to create a new user", async () => {
    const admin = await seedUser({ username: "boss", role: "admin" });
    const cookie = await loginCookie(app, admin.username, admin.password);

    const res = await request(app)
      .post("/api/auth/register")
      .set("Cookie", cookie)
      .send({
        username: "created",
        password: "password123",
        nama: "Created User",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.user.username).toBe("created");
    expect(res.body.data.user.role).toBe("user");
  });
});

describe("GET /api/auth/profile", () => {
  it("returns 401 without an auth cookie", async () => {
    const res = await request(app).get("/api/auth/profile");
    expect(res.status).toBe(401);
  });

  it("returns the current user with a valid cookie", async () => {
    const user = await seedUser({ username: "dave", nama: "Dave" });
    const cookie = await loginCookie(app, user.username, user.password);

    const res = await request(app)
      .get("/api/auth/profile")
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.data.username).toBe("dave");
    expect(res.body.data.password).toBeUndefined();
  });

  it("rejects a valid token passed via ?token= on a non-stream route", async () => {
    // The ?token= transport is accepted ONLY on /api/stream (SSE cannot send
    // headers). Allowing it elsewhere would leak tokens into access logs, so a
    // valid token in the query string must NOT authenticate other routes.
    const user = await seedUser({ username: "erin", nama: "Erin" });
    const login = await request(app)
      .post("/api/auth/login")
      .send({ username: user.username, password: user.password });
    const token = login.body.data.token as string;
    expect(token).toBeTruthy();

    const res = await request(app).get(`/api/auth/profile?token=${token}`);

    expect(res.status).toBe(401);
  });
});
