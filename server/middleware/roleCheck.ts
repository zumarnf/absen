import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";

/**
 * Flexible role checker middleware — checks if user has one of the allowed roles.
 * Usage: roleCheck("admin"), roleCheck("admin", "user")
 */
export const roleCheck = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(" or ")}`,
      });
      return;
    }

    next();
  };
};

// Convenience aliases using the shared roleCheck implementation (DRY)
export const requireAdmin = roleCheck("admin");
export const requireUser = roleCheck("user");
