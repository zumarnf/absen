import { Router } from "express";
import {
  createSchedule,
  getUserSchedule,
  getMySchedule,
  updateSchedule,
  deleteSchedule,
  getAllSchedules,
  getAllSchedulesGrouped,
} from "../controllers/scheduleController";
import { authenticate } from "../middleware/auth";
import { requireAdmin } from "../middleware/roleCheck";

const router = Router();

// User routes
router.get("/me", authenticate, getMySchedule);
router.get("/user/:userId", authenticate, getUserSchedule);
router.get("/grouped", authenticate, getAllSchedulesGrouped); // New endpoint for dashboard

// Admin routes
router.post("/", authenticate, requireAdmin, createSchedule);
router.put("/:id", authenticate, requireAdmin, updateSchedule);
router.delete("/:id", authenticate, requireAdmin, deleteSchedule);
router.get("/all", authenticate, requireAdmin, getAllSchedules);

export default router;
