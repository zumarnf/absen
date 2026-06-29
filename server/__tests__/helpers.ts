import request from "supertest";
import type { Application } from "express";
import User from "../models/User";

export interface SeededUser {
  id: string;
  username: string;
  password: string;
  nama: string;
  role: "admin" | "user";
}

/**
 * Seed a user directly through the model. Used only to set up fixtures; the
 * behavior under test is always exercised through the HTTP API.
 */
export async function seedUser(
  overrides: Partial<Omit<SeededUser, "id">> = {},
): Promise<SeededUser> {
  const username = overrides.username ?? `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const password = overrides.password ?? "password123";
  const nama = overrides.nama ?? "Test User";
  const role = overrides.role ?? "user";

  const user = await User.create({ username, password, nama, role });
  return { id: user._id.toString(), username, password, nama, role };
}

/**
 * Log in through the API and return the httpOnly auth cookie so subsequent
 * requests can be authenticated the same way a real browser would.
 */
export async function loginCookie(
  app: Application,
  username: string,
  password: string,
): Promise<string[]> {
  const res = await request(app)
    .post("/api/auth/login")
    .send({ username, password });
  const setCookie = res.headers["set-cookie"];
  return Array.isArray(setCookie) ? setCookie : setCookie ? [setCookie] : [];
}
