import { Response } from "express";
import User from "../models/User";
import Attendance from "../models/Attendance";
import Schedule from "../models/Schedule";
import CourseSchedule from "../models/CourseSchedule";
import { AuthRequest } from "../types";
import { asyncHandler } from "../middleware/asyncHandler";
import { parsePagination, buildPaginationMeta } from "../utils/queryHelpers";

// @route   GET /api/users/all
// @desc    Get all users (Admin only)
// @access  Private (Admin)
export const getAllUsers = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { role } = req.query;
    const { page, limit, skip } = parsePagination(
      req.query.page,
      req.query.limit || 100,
    );

    const query: Record<string, unknown> = {};
    if (role === "admin" || role === "user") {
      query.role = role;
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select("-password")
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: users,
      meta: buildPaginationMeta(total, page, limit),
    });
  },
);

// @route   GET /api/users/select
// @desc    Minimal user list for non-admin dropdowns (e.g., coverage target).
//         Excludes admins and the requesting user. Returns only safe fields.
// @access  Private (any authenticated user)
export const getUsersForSelect = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const requesterId = req.user?.userId;
    const users = await User.find({
      role: { $ne: "admin" },
      ...(requesterId ? { _id: { $ne: requesterId } } : {}),
    })
      .select("_id username nama role")
      .sort({ nama: 1 });

    res.status(200).json({ success: true, data: users });
  },
);

// @route   GET /api/users/:userId
// @desc    Get user by ID (Admin only)
// @access  Private (Admin)
export const getUserById = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.status(200).json({ success: true, data: user });
  },
);

// @route   DELETE /api/users/:userId
// @desc    Delete user and all related data (Admin only)
// @access  Private (Admin)
export const deleteUser = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    if (user.role === "admin") {
      res
        .status(403)
        .json({ success: false, message: "Cannot delete admin users" });
      return;
    }

    // Delete all related data in parallel, then the user
    await Promise.all([
      Attendance.deleteMany({ userId }),
      Schedule.deleteMany({ userId }),
      CourseSchedule.deleteMany({ userId }),
    ]);

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "User and all related data deleted successfully",
    });
  },
);
