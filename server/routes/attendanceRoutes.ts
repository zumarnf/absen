import { Router } from "express";
import {
  checkin,
  getHistory,
  getMonthlySummary,
  getUserAttendance,
  getAllAttendance,
} from "../controllers/attendanceController";
import { authenticate } from "../middleware/auth";
import { requireAdmin } from "../middleware/roleCheck";

const router = Router();

// User routes (require authentication)
router.post("/checkin", authenticate, checkin);
router.get("/history", authenticate, getHistory);
router.get("/monthly", authenticate, getMonthlySummary);

// Admin routes (require authentication + admin role)
router.get("/user/:userId", authenticate, requireAdmin, getUserAttendance);
router.get("/all", authenticate, requireAdmin, getAllAttendance);

export default router;
