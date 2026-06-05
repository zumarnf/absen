import { Response } from "express";
import Attendance from "../models/Attendance";
import User from "../models/User";
import { AuthRequest, IShiftAttendance } from "../types";
import { getMonthlyPeriod, formatPeriodName } from "../utils/dateHelper";
import { asyncHandler } from "../middleware/asyncHandler";
import {
  buildDateFilter,
  parsePagination,
  buildPaginationMeta,
} from "../utils/queryHelpers";
import eventBus from "../utils/eventBus";

// @route   POST /api/attendance/checkin
// @desc    User check-in with shift and pos selection
// @access  Private (User)
export const checkin = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { shifts }: { shifts: IShiftAttendance[] } = req.body;
    const userId = req.user?.userId;

    if (!shifts || !Array.isArray(shifts) || shifts.length === 0) {
      res.status(400).json({
        success: false,
        message: "Please select at least one shift",
      });
      return;
    }

    const validShifts = shifts.every(
      (s) => s.shift >= 1 && s.shift <= 5 && (s.pos === 1 || s.pos === 2),
    );
    if (!validShifts) {
      res.status(400).json({
        success: false,
        message: "Invalid shift (must be 1-5) or pos (must be 1 or 2)",
      });
      return;
    }

    // Remove duplicates based on shift number
    const uniqueShiftsMap = new Map<number, IShiftAttendance>();
    shifts.forEach((s) => uniqueShiftsMap.set(s.shift, s));
    const uniqueShifts = Array.from(uniqueShiftsMap.values()).sort(
      (a, b) => a.shift - b.shift,
    );

    // Check-in date is always the current server date. A client-supplied
    // date is intentionally ignored to prevent backdating/post-dating
    // attendance records, which would let users fabricate worked hours.
    const attendanceDate = new Date();
    attendanceDate.setHours(0, 0, 0, 0);

    // Check if already checked in for this date
    const existingAttendance = await Attendance.findOne({
      userId,
      date: attendanceDate,
    });

    if (existingAttendance) {
      res.status(400).json({
        success: false,
        message: "You have already checked in for this date",
        data: existingAttendance,
      });
      return;
    }

    // totalHours is calculated by pre-save hook in Attendance model
    const attendance = await Attendance.create({
      userId,
      date: attendanceDate,
      shifts: uniqueShifts,
      totalHours: 0, // Will be overwritten by pre-save hook
    });

    const populatedAttendance = await Attendance.findById(
      attendance._id,
    ).populate("userId", "username nama role");

    // Notify connected SSE listeners (admin dashboards)
    eventBus.emit("attendance:created", {
      _id: populatedAttendance?._id,
      userId: populatedAttendance?.userId,
      date: populatedAttendance?.date,
      shifts: populatedAttendance?.shifts,
      totalHours: populatedAttendance?.totalHours,
    });

    res.status(201).json({
      success: true,
      message: "Check-in successful",
      data: populatedAttendance,
    });
  },
);

// @route   GET /api/attendance/history
// @desc    Get user's attendance history
// @access  Private (User)
export const getHistory = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    const { startDate, endDate } = req.query;
    const { page, limit, skip } = parsePagination(
      req.query.page,
      req.query.limit,
    );

    const query: Record<string, unknown> = { userId };
    const dateFilter = buildDateFilter(startDate as string, endDate as string);
    if (dateFilter) query.date = dateFilter;

    const [attendances, total] = await Promise.all([
      Attendance.find(query)
        .sort({ date: -1 })
        .limit(limit)
        .skip(skip)
        .populate("userId", "username nama role"),
      Attendance.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: attendances,
      meta: buildPaginationMeta(total, page, limit),
    });
  },
);

// @route   GET /api/attendance/monthly
// @desc    Get monthly attendance summary (period from 15th to 14th)
// @access  Private (User)
export const getMonthlySummary = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    const { date } = req.query;

    const referenceDate = date ? new Date(date as string) : new Date();
    const { periodStart, periodEnd } = getMonthlyPeriod(referenceDate);

    const attendances = await Attendance.find({
      userId,
      date: { $gte: periodStart, $lte: periodEnd },
    }).sort({ date: 1 });

    const totalHours = attendances.reduce(
      (sum, att) => sum + att.totalHours,
      0,
    );
    const totalDays = attendances.length;

    res.status(200).json({
      success: true,
      data: {
        totalDays,
        totalHours,
        period: formatPeriodName(periodStart, periodEnd),
      },
    });
  },
);

// @route   GET /api/attendance/user/:userId
// @desc    Get attendance for specific user (Admin only)
// @access  Private (Admin)
export const getUserAttendance = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;
    const { page, limit, skip } = parsePagination(
      req.query.page,
      req.query.limit,
    );

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const query: Record<string, unknown> = { userId };
    const dateFilter = buildDateFilter(startDate as string, endDate as string);
    if (dateFilter) query.date = dateFilter;

    const [attendances, total] = await Promise.all([
      Attendance.find(query)
        .sort({ date: -1 })
        .limit(limit)
        .skip(skip)
        .populate("userId", "username nama role"),
      Attendance.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          username: user.username,
          nama: user.nama,
          role: user.role,
        },
        attendances,
      },
      meta: buildPaginationMeta(total, page, limit),
    });
  },
);

// @route   GET /api/attendance/all
// @desc    Get all attendance records (Admin only)
// @access  Private (Admin)
export const getAllAttendance = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { startDate, endDate } = req.query;
    const { page, limit, skip } = parsePagination(
      req.query.page,
      req.query.limit,
    );

    const query: Record<string, unknown> = {};
    const dateFilter = buildDateFilter(startDate as string, endDate as string);
    if (dateFilter) query.date = dateFilter;

    const [attendances, total] = await Promise.all([
      Attendance.find(query)
        .sort({ date: -1 })
        .limit(limit)
        .skip(skip)
        .populate("userId", "username nama role"),
      Attendance.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: attendances,
      meta: buildPaginationMeta(total, page, limit),
    });
  },
);
