import { Secret, SignOptions } from "jsonwebtoken";
import type { CookieOptions } from "express";

// Name of the httpOnly cookie that carries the JWT. Kept in one place so the
// controller (set/clear) and the auth middleware (read) never drift apart.
export const AUTH_COOKIE_NAME = "token";

/**
 * Known placeholder/example secrets shipped with the project. If one of these
 * ever reaches a running server, attackers could forge valid tokens, so we
 * refuse to start instead of failing open.
 */
const FORBIDDEN_SECRETS = new Set<string>([
  "absensi_logistik_super_secret_key_2024_change_in_production",
  "your_jwt_secret",
  "change_in_production",
  "changeme",
  "secret",
]);

// Minimum length to keep the HMAC secret from being trivially brute-forced.
const MIN_SECRET_LENGTH = 32;

/**
 * Resolve the JWT signing/verification secret from the environment.
 * Fails fast (throws) when JWT_SECRET is missing, a known placeholder, or
 * too short, so the server never silently falls back to a guessable secret
 * that would allow attackers to forge valid tokens.
 */
export const getJwtSecret = (): Secret => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim().length === 0) {
    throw new Error(
      "JWT_SECRET is not set. Refusing to start with an insecure default.",
    );
  }

  const normalized = secret.trim();
  if (
    FORBIDDEN_SECRETS.has(normalized) ||
    normalized.length < MIN_SECRET_LENGTH
  ) {
    throw new Error(
      "JWT_SECRET is weak or a known placeholder. Set a unique random " +
        "value of at least 32 characters (e.g. `openssl rand -base64 48`).",
    );
  }

  return secret;
};

/**
 * Token lifetime. Reads JWT_EXPIRE from the environment (e.g. "1d", "12h")
 * and defaults to a short "1d" instead of a long-lived 7-day token to
 * limit the exposure window of a stolen token.
 */
export const getJwtExpiresIn = (): SignOptions["expiresIn"] => {
  return (process.env.JWT_EXPIRE ||
    "1d") as SignOptions["expiresIn"];
};

/**
 * Translate JWT_EXPIRE (e.g. "1d", "12h", "30m", "3600") into milliseconds so
 * the auth cookie's lifetime matches the token's. Falls back to 1 day for any
 * unrecognized format.
 */
export const getCookieMaxAgeMs = (): number => {
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const raw = (process.env.JWT_EXPIRE || "1d").trim();
  const match = /^(\d+)\s*([smhd])?$/i.exec(raw);
  if (!match) return ONE_DAY_MS;

  const value = parseInt(match[1], 10);
  const unit = (match[2] || "s").toLowerCase();
  const unitMs: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: ONE_DAY_MS,
  };
  return value * (unitMs[unit] ?? 1000);
};

/**
 * Shared cookie attributes for the auth token. The token lives in an httpOnly
 * cookie so client-side JavaScript (and therefore any XSS) can never read it.
 *
 * SameSite defaults to "lax", which keeps the cookie out of cross-site
 * requests (basic CSRF protection) while still allowing the SPA's same-site
 * XHR. For a cross-site deployment (frontend and backend on different
 * registrable domains) set COOKIE_SAMESITE=none — browsers then require the
 * Secure flag, so it is forced on automatically.
 */
export const getAuthCookieOptions = (): CookieOptions => {
  const isProduction = process.env.NODE_ENV === "production";
  const sameSite = (process.env.COOKIE_SAMESITE ||
    "lax") as CookieOptions["sameSite"];
  const secure = sameSite === "none" ? true : isProduction;

  return {
    httpOnly: true,
    secure,
    sameSite,
    path: "/",
  };
};
