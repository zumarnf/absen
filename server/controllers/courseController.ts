import { Response } from "express";
import CourseSchedule from "../models/CourseSchedule";
import User from "../models/User";
import { AuthRequest, ICourse } from "../types";
import { asyncHandler } from "../middleware/asyncHandler";
import { parsePagination, buildPaginationMeta } from "../utils/queryHelpers";

// Time format regex (HH:mm)
const TIME_REGEX = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

// Validate courses format
function validateCoursesFormat(courses: ICourse[]): boolean {
  return courses.every(
    (course) =>
      course.namaMataKuliah &&
      course.hari >= 0 &&
      course.hari <= 6 &&
      course.jamMulai &&
      course.jamSelesai &&
      TIME_REGEX.test(course.jamMulai) &&
      TIME_REGEX.test(course.jamSelesai),
  );
}

// @route   POST /api/courses
// @desc    Create/Submit course schedule
// @access  Private (User)
export const createCourseSchedule = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { courses, semester, tahunAjaran } = req.body;
    const userId = req.user?.userId;

    if (!courses || !Array.isArray(courses) || courses.length === 0) {
      res.status(400).json({
        success: false,
        message: "Please provide courses array",
      });
      return;
    }

    if (!semester || !tahunAjaran) {
      res.status(400).json({
        success: false,
        message: "Please provide semester and tahunAjaran",
      });
      return;
    }

    if (!validateCoursesFormat(courses)) {
      res.status(400).json({
        success: false,
        message:
          "Invalid course format. Check namaMataKuliah, hari, jamMulai, jamSelesai",
      });
      return;
    }

    // Deactivate existing active course schedules for this user
    await CourseSchedule.updateMany(
      { userId, isActive: true },
      { isActive: false },
    );

    const courseSchedule = await CourseSchedule.create({
      userId,
      courses,
      semester,
      tahunAjaran,
      isActive: true,
    });

    const populatedSchedule = await CourseSchedule.findById(
      courseSchedule._id,
    ).populate("userId", "username nama role");

    res.status(201).json({
      success: true,
      message: "Course schedule submitted successfully",
      data: populatedSchedule,
    });
  },
);

// @route   GET /api/courses/me
// @desc    Get current user's course schedule
// @access  Private (User)
export const getMyCourseSchedule = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.userId;

    const courseSchedule = await CourseSchedule.findOne({
      userId,
      isActive: true,
    }).populate("userId", "username nama role");

    if (!courseSchedule) {
      res.status(404).json({
        success: false,
        message: "No active course schedule found",
      });
      return;
    }

    res.status(200).json({ success: true, data: courseSchedule });
  },
);

// @route   GET /api/courses/user/:userId
// @desc    Get course schedule for specific user (Admin)
// @access  Private (Admin)
export const getUserCourseSchedule = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const courseSchedule = await CourseSchedule.findOne({
      userId,
      isActive: true,
    }).populate("userId", "username nama role");

    if (!courseSchedule) {
      res.status(404).json({
        success: false,
        message: "No active course schedule found for this user",
      });
      return;
    }

    res.status(200).json({ success: true, data: courseSchedule });
  },
);

// @route   GET /api/courses/all
// @desc    Get all course schedules (Admin only)
// @access  Private (Admin)
export const getAllCourseSchedules = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { isActive } = req.query;
    const { page, limit, skip } = parsePagination(
      req.query.page,
      req.query.limit,
    );

    const query: Record<string, unknown> = {};
    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    const [courseSchedules, total] = await Promise.all([
      CourseSchedule.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .populate("userId", "username nama role"),
      CourseSchedule.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: courseSchedules,
      meta: buildPaginationMeta(total, page, limit),
    });
  },
);

// @route   PUT /api/courses/:id
// @desc    Update course schedule (User themselves)
// @access  Private (User)
export const updateCourseSchedule = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { courses, semester, tahunAjaran, isActive } = req.body;
    const userId = req.user?.userId;

    const courseSchedule = await CourseSchedule.findById(id);
    if (!courseSchedule) {
      res.status(404).json({
        success: false,
        message: "Course schedule not found",
      });
      return;
    }

    if (courseSchedule.userId.toString() !== userId) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }

    if (courses !== undefined) {
      if (!validateCoursesFormat(courses)) {
        res.status(400).json({
          success: false,
          message: "Invalid course format",
        });
        return;
      }
      courseSchedule.courses = courses;
    }

    if (semester !== undefined) courseSchedule.semester = semester;
    if (tahunAjaran !== undefined) courseSchedule.tahunAjaran = tahunAjaran;
    if (isActive !== undefined) courseSchedule.isActive = isActive;

    await courseSchedule.save();

    const updatedSchedule = await CourseSchedule.findById(id).populate(
      "userId",
      "username nama role",
    );

    res.status(200).json({
      success: true,
      message: "Course schedule updated successfully",
      data: updatedSchedule,
    });
  },
);

// @route   DELETE /api/courses/:id
// @desc    Delete course schedule (User themselves)
// @access  Private (User)
export const deleteCourseSchedule = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    const courseSchedule = await CourseSchedule.findById(id);
    if (!courseSchedule) {
      res.status(404).json({
        success: false,
        message: "Course schedule not found",
      });
      return;
    }

    const isOwner = courseSchedule.userId.toString() === userId;
    const isAdmin = userRole === "admin";

    if (!isOwner && !isAdmin) {
      res.status(403).json({
        success: false,
        message:
          "Access denied. Only the owner or admin can delete this course schedule.",
      });
      return;
    }

    await CourseSchedule.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Course schedule deleted successfully",
    });
  },
);
