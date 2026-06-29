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

/** Normalize supertest's set-cookie header into a string array. */
function toCookieArray(setCookie: unknown): string[] {
  if (Array.isArray(setCookie)) return setCookie as string[];
  return setCookie ? [setCookie as string] : [];
}

/** Extract the `name=value` pair (drops attributes) from each Set-Cookie. */
function cookiePairs(setCookie: unknown): string[] {
  return toCookieArray(setCookie).map((c) => c.split(";")[0]);
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
  return toCookieArray(res.headers["set-cookie"]);
}

/**
 * Log in and build the header set a browser would send on a state-changing
 * request: the cookies (auth + CSRF) plus the matching `X-CSRF-Token` header
 * for the double-submit guard. Pass the result straight to supertest `.set()`.
 */
export async function authHeaders(
  app: Application,
  username: string,
  password: string,
): Promise<Record<string, string>> {
  const res = await request(app)
    .post("/api/auth/login")
    .send({ username, password });
  const pairs = cookiePairs(res.headers["set-cookie"]);
  const csrf = pairs
    .find((p) => p.startsWith("csrf-token="))
    ?.slice("csrf-token=".length);

  return {
    Cookie: pairs.join("; "),
    "X-CSRF-Token": csrf ?? "",
  };
}
