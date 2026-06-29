import { Request, Response, NextFunction } from "express";
import {
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
  csrfTokensMatch,
} from "../utils/csrf";
import { AUTH_COOKIE_NAME } from "../utils/jwt";

// Safe methods do not change state, so they are exempt (per RFC 7231).
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * Double-submit cookie CSRF guard. For every state-changing request from an
 * authenticated session it requires the `X-CSRF-Token` header to match the
 * `csrf-token` cookie, failing closed (403) when missing or mismatched.
 *
 * CSRF only matters for authenticated, cookie-driven actions: a request without
 * the auth cookie cannot perform a privileged action (the route's auth guard
 * returns 401), and login itself arrives before any token is issued. So when no
 * auth cookie is present the guard steps aside and lets normal auth handle it —
 * this preserves existing 401 semantics without weakening protection, because a
 * forged cross-site request still rides the victim's auth cookie yet cannot read
 * the CSRF cookie to set the matching header.
 */
export const csrfProtection = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (SAFE_METHODS.has(req.method)) {
    next();
    return;
  }

  const hasSession = typeof req.cookies?.[AUTH_COOKIE_NAME] === "string";
  if (!hasSession) {
    next();
    return;
  }

  const cookieToken = (req.cookies?.[CSRF_COOKIE_NAME] ?? undefined) as
    | string
    | undefined;
  const headerToken = req.header(CSRF_HEADER_NAME);

  if (!csrfTokensMatch(cookieToken, headerToken)) {
    res.status(403).json({
      success: false,
      message: "Invalid or missing CSRF token",
    });
    return;
  }

  next();
};
