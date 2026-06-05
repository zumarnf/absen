import { Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AuthRequest } from "../types";
import { getJwtSecret } from "../utils/jwt";

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
    // EventSource cannot send custom headers, so we accept a ?token= query
    // param ONLY for SSE stream routes. Restricting it elsewhere prevents
    // tokens from leaking into access logs / proxy history for normal APIs.
    const headerToken = req.header("Authorization")?.replace("Bearer ", "");
    const isStreamRoute = req.baseUrl.startsWith("/api/stream");
    const queryToken =
      isStreamRoute && typeof req.query.token === "string"
        ? req.query.token
        : undefined;
    const token = headerToken || queryToken;

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
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
