import { Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AuthRequest } from "../types";
import { getJwtSecret, AUTH_COOKIE_NAME } from "../utils/jwt";

interface DecodedToken extends JwtPayload {
  userId: string;
  username: string;
  role: "admin" | "user";
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Primary transport is the httpOnly auth cookie. The Authorization header
    // is still accepted for backward compatibility / non-browser clients.
    const headerToken = req.header("Authorization")?.replace("Bearer ", "");
    const cookieToken = req.cookies?.[AUTH_COOKIE_NAME] as string | undefined;
    // EventSource cannot send custom headers; the cookie covers it, but we keep
    // a ?token= fallback ONLY for SSE stream routes. Restricting it elsewhere
    // prevents tokens from leaking into access logs / proxy history.
    const isStreamRoute = req.baseUrl.startsWith("/api/stream");
    const queryToken =
      isStreamRoute && typeof req.query.token === "string"
        ? req.query.token
        : undefined;
    const token = headerToken || cookieToken || queryToken;

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const decoded = jwt.verify(token, getJwtSecret()) as DecodedToken;

    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role,
    };

    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
