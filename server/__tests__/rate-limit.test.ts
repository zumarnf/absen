import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import type { Application } from "express";
import { createApp } from "../app";

// Isolated file: the auth rate-limiter keeps per-IP state in module memory, and
// vitest gives each test file a fresh module registry, so the counter starts
// clean here.
let app: Application;

beforeAll(() => {
  app = createApp();
});

describe("Login brute-force protection (authLimiter)", () => {
  it("blocks with 429 after exceeding the failed-login limit", async () => {
    const attempt = () =>
      request(app)
        .post("/api/auth/login")
        .send({ username: "nobody", password: "wrong-password" });

    // The limiter allows 10 attempts per window; failed logins are counted.
    for (let i = 0; i < 10; i++) {
      const res = await attempt();
      expect(res.status).toBe(401);
    }

    const blocked = await attempt();
    expect(blocked.status).toBe(429);
    expect(blocked.body.message).toMatch(/too many/i);
  });
});
