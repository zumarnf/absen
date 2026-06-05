import { Router } from "express";
import {
  createCourseSchedule,
  getMyCourseSchedule,
  getUserCourseSchedule,
  getAllCourseSchedules,
  updateCourseSchedule,
  deleteCourseSchedule,
} from "../controllers/courseController";
import { authenticate } from "../middleware/auth";
import { requireAdmin } from "../middleware/roleCheck";

const router = Router();

// User routes
router.post("/", authenticate, createCourseSchedule);
router.get("/me", authenticate, getMyCourseSchedule);
router.put("/:id", authenticate, updateCourseSchedule);
router.delete("/:id", authenticate, deleteCourseSchedule);

// Admin routes
router.get("/user/:userId", authenticate, requireAdmin, getUserCourseSchedule);
router.get("/all", authenticate, requireAdmin, getAllCourseSchedules);

export default router;
