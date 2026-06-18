import { Router } from "express";
import {
  register,
  login,
  logout,
  getProfile,
  verifyToken,
} from "../controllers/authController";
import { authenticate } from "../middleware/auth";
import { requireAdmin } from "../middleware/roleCheck";
import { authLimiter } from "../middleware/rateLimiter";

const router = Router();

// Admin-only route (create new user)
router.post("/register", authenticate, requireAdmin, register);
router.post("/login", authLimiter, login);
router.post("/logout", logout);

// Protected routes
router.get("/profile", authenticate, getProfile);
router.get("/verify", authenticate, verifyToken);

export default router;
