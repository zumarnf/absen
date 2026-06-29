import { randomBytes, timingSafeEqual } from "node:crypto";
import type { CookieOptions } from "express";

/**
 * CSRF protection via the stateless "double-submit cookie" pattern:
 *  - On login the server sets a random token in a NON-httpOnly cookie so the
 *    SPA's JavaScript can read it.
 *  - For every state-changing request the client echoes that value back in the
 *    `X-CSRF-Token` header.
 *  - The middleware accepts the request only when the header matches the cookie.
 *
 * A cross-site attacker can trigger a request that carries the victim's cookies
 * (defeating cookie-only auth) but, blocked by the same-origin policy, cannot
 * read the cookie value to set the matching header — so the forged request is
 * rejected. This complements the auth cookie's `SameSite` attribute.
 */
export const CSRF_COOKIE_NAME = "csrf-token";
export const CSRF_HEADER_NAME = "x-csrf-token";

/** Generate a fresh, unguessable CSRF token. */
export const generateCsrfToken = (): string => randomBytes(32).toString("hex");

/**
 * Cookie attributes for the CSRF token. Mirrors the auth cookie's SameSite /
 * Secure handling, but is intentionally NOT httpOnly so the client can read it
 * and echo it back in the request header (that is the whole point of the
 * double-submit pattern).
 */
export const getCsrfCookieOptions = (): CookieOptions => {
  const isProduction = process.env.NODE_ENV === "production";
  const sameSite = (process.env.COOKIE_SAMESITE ||
    "lax") as CookieOptions["sameSite"];
  const secure = sameSite === "none" ? true : isProduction;

  return {
    httpOnly: false,
    secure,
    sameSite,
    path: "/",
  };
};

/** Constant-time comparison of the cookie token and the header token. */
export const csrfTokensMatch = (
  cookieToken: unknown,
  headerToken: unknown,
): boolean => {
  if (typeof cookieToken !== "string" || typeof headerToken !== "string") {
    return false;
  }
  if (cookieToken.length === 0 || cookieToken.length !== headerToken.length) {
    return false;
  }
  return timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken));
};
