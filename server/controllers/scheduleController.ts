import { Response } from "express";
import Schedule from "../models/Schedule";
import User from "../models/User";
import { AuthRequest, IScheduleShift } from "../types";
import { asyncHandler } from "../middleware/asyncHandler";
import { parsePagination, buildPaginationMeta } from "../utils/queryHelpers";

// Typed view of the Schedule model's custom static (declared in the schema).
type ScheduleStatics = {
  validateShiftCapacity: (
    dayOfWeek: number,
    shift: number,
    pos: number,
    excludeUserId?: string,
  ) => Promise<boolean>;
};

// Helper function to get day name
function getDayName(dayOfWeek: number): string {
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  return days[dayOfWeek] || "Unknown";
}

// Run all shift capacity checks in parallel and return the first full slot
// (or null when every slot still has capacity). Keeps original first-found
// order since Promise.all preserves input order.
async function findFullShiftSlot(
  schedules: IScheduleShift[],
  excludeUserId?: string,
): Promise<{ dayOfWeek: number; shift: number; pos: number } | null> {
  const checks = schedules.flatMap((scheduleItem) =>
    scheduleItem.shifts.map(async (shift: number) => ({
      dayOfWeek: scheduleItem.dayOfWeek,
      shift,
      pos: scheduleItem.pos,
      hasCapacity: await (
        Schedule as unknown as ScheduleStatics
      ).validateShiftCapacity(
        scheduleItem.dayOfWeek,
        shift,
        scheduleItem.pos,
        excludeUserId,
      ),
    })),
  );

  const results = await Promise.all(checks);
  return results.find((result) => !result.hasCapacity) ?? null;
}

// Validate schedules format
function validateSchedulesFormat(schedules: IScheduleShift[]): boolean {
  return schedules.every(
    (schedule) =>
      schedule.dayOfWeek >= 0 &&
      schedule.dayOfWeek <= 6 &&
      Array.isArray(schedule.shifts) &&
      schedule.shifts.length > 0 &&
      schedule.shifts.every((shift: number) => shift >= 1 && shift <= 5) &&
      (schedule.pos === 1 || schedule.pos === 2),
  );
}

// @route   POST /api/schedules
// @desc    Create schedule for user (Admin only)
// @access  Private (Admin)
export const createSchedule = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { userId, schedules } = req.body;

    if (
      !userId ||
      !schedules ||
      !Array.isArray(schedules) ||
      schedules.length === 0
    ) {
      res.status(400).json({
        success: false,
        message: "Please provide userId and schedules array",
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    if (!validateSchedulesFormat(schedules)) {
      res.status(400).json({
        success: false,
        message:
          "Invalid schedule format. dayOfWeek must be 0-6, shifts must be 1-5, pos must be 1 or 2",
      });
      return;
    }

    // Validate shift capacity (max 3 users per shift per pos)
    const fullSlot = await findFullShiftSlot(schedules);
    if (fullSlot) {
      res.status(400).json({
        success: false,
        message: `Shift ${fullSlot.shift} pada hari ${getDayName(fullSlot.dayOfWeek)} di Pos ${fullSlot.pos} sudah penuh (maksimal 3 user)`,
      });
      return;
    }

    // Deactivate existing active schedules for this user
    await Schedule.updateMany({ userId, isActive: true }, { isActive: false });

    const schedule = await Schedule.create({
      userId,
      schedules,
      isActive: true,
    });

    const populatedSchedule = await Schedule.findById(schedule._id).populate(
      "userId",
      "username nama role",
    );

    res.status(201).json({
      success: true,
      message: "Schedule created successfully",
      data: populatedSchedule,
    });
  },
);

// @route   GET /api/schedules/user/:userId
// @desc    Get schedule for specific user
// @access  Private (Admin or User themselves)
export const getUserSchedule = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { userId } = req.params;
    const requestingUserId = req.user?.userId;
    const requestingUserRole = req.user?.role;

    if (requestingUserRole !== "admin" && requestingUserId !== userId) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const schedule = await Schedule.findOne({
      userId,
      isActive: true,
    }).populate("userId", "username nama role");

    if (!schedule) {
      res.status(404).json({
        success: false,
        message: "No active schedule found for this user",
      });
      return;
    }

    res.status(200).json({ success: true, data: schedule });
  },
);

// @route   GET /api/schedules/me
// @desc    Get current user's schedule
// @access  Private (User)
export const getMySchedule = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.userId;

    const schedule = await Schedule.findOne({
      userId,
      isActive: true,
    }).populate("userId", "username nama role");

    if (!schedule) {
      res.status(404).json({
        success: false,
        message: "No active schedule found",
      });
      return;
    }

    res.status(200).json({ success: true, data: schedule });
  },
);

// @route   PUT /api/schedules/:id
// @desc    Update schedule (Admin only)
// @access  Private (Admin)
export const updateSchedule = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { schedules, isActive } = req.body;

    const schedule = await Schedule.findById(id);
    if (!schedule) {
      res.status(404).json({ success: false, message: "Schedule not found" });
      return;
    }

    if (schedules !== undefined) {
      if (!validateSchedulesFormat(schedules)) {
        res.status(400).json({
          success: false,
          message: "Invalid schedule format",
        });
        return;
      }

      // Validate shift capacity (exclude current user)
      const fullSlot = await findFullShiftSlot(
        schedules,
        schedule.userId.toString(),
      );
      if (fullSlot) {
        res.status(400).json({
          success: false,
          message: `Shift ${fullSlot.shift} pada hari ${getDayName(fullSlot.dayOfWeek)} di Pos ${fullSlot.pos} sudah penuh (maksimal 3 user)`,
        });
        return;
      }

      schedule.schedules = schedules;
    }

    if (isActive !== undefined) {
      schedule.isActive = isActive;
    }

    await schedule.save();

    const updatedSchedule = await Schedule.findById(id).populate(
      "userId",
      "username nama role",
    );

    res.status(200).json({
      success: true,
      message: "Schedule updated successfully",
      data: updatedSchedule,
    });
  },
);

// @route   DELETE /api/schedules/:id
// @desc    Delete schedule (Admin only)
// @access  Private (Admin)
export const deleteSchedule = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    const schedule = await Schedule.findById(id);
    if (!schedule) {
      res.status(404).json({ success: false, message: "Schedule not found" });
      return;
    }

    await Schedule.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Schedule deleted successfully",
    });
  },
);

// @route   GET /api/schedules/all
// @desc    Get all schedules (Admin only)
// @access  Private (Admin)
export const getAllSchedules = asyncHandler(
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

    const [schedules, total] = await Promise.all([
      Schedule.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .populate("userId", "username nama role")
        .lean(),
      Schedule.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: schedules,
      meta: buildPaginationMeta(total, page, limit),
    });
  },
);

// @route   GET /api/schedules/grouped
// @desc    Get all schedules grouped by day, shift, and pos for dashboard
// @access  Private (Admin and User)
export const getAllSchedulesGrouped = asyncHandler(
  async (_req: AuthRequest, res: Response): Promise<void> => {
    const schedules = await Schedule.find({ isActive: true })
      .populate("userId", "username nama role")
      .lean();

    // Structure: { [dayOfWeek]: { dayName, shifts: { [shift]: { pos1, pos2 } } } }
    const groupedSchedules: Record<
      number,
      {
        dayName: string;
        shifts: Record<number, { pos1: unknown[]; pos2: unknown[] }>;
      }
    > = {};

    // Initialize structure for all days (0-6) and shifts (1-5)
    for (let day = 0; day <= 6; day++) {
      groupedSchedules[day] = { dayName: getDayName(day), shifts: {} };
      for (let shift = 1; shift <= 5; shift++) {
        groupedSchedules[day].shifts[shift] = { pos1: [], pos2: [] };
      }
    }

    // Populate with actual user data
    for (const schedule of schedules) {
      const userId = schedule.userId as unknown as {
        _id: string;
        username: string;
        nama: string;
        role: string;
      };

      for (const scheduleItem of schedule.schedules) {
        const { dayOfWeek, shifts, pos } = scheduleItem;
        const posKey = pos === 1 ? "pos1" : "pos2";

        for (const shift of shifts) {
          groupedSchedules[dayOfWeek].shifts[shift][posKey].push({
            userId: userId._id,
            username: userId.username,
            nama: userId.nama,
            role: userId.role,
          });
        }
      }
    }

    res.status(200).json({ success: true, data: groupedSchedules });
  },
);
