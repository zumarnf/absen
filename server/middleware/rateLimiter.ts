import rateLimit from "express-rate-limit";

/**
 * General limiter for the whole API surface. Generous enough for normal
 * usage but caps abusive request floods (basic DoS mitigation).
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 300, // per IP per window
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
});

/**
 * Strict limiter for authentication endpoints to slow down brute-force
 * and credential-stuffing attacks against /login.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // login attempts per IP per window
  standardHeaders: "draft-7",
  legacyHeaders: false,
  // Do not count successful logins against the limit
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: "Too many login attempts, please try again later",
  },
});
