import { Response } from "express";
import mongoose from "mongoose";
import ShiftCoverage from "../models/ShiftCoverage";
import Schedule from "../models/Schedule";
import User from "../models/User";
import { AuthRequest, PosNumber, ShiftNumber } from "../types";
import { asyncHandler } from "../middleware/asyncHandler";

const POPULATE_USERS = [
  { path: "requesterId", select: "username nama role" },
  { path: "targetUserId", select: "username nama role" },
] as const;

function isValidShift(shift: unknown): shift is number {
  return typeof shift === "number" && shift >= 1 && shift <= 5;
}

function isValidPos(pos: unknown): pos is 1 | 2 {
  return pos === 1 || pos === 2;
}

function normalizeDate(value: unknown): Date | null {
  if (!value || (typeof value !== "string" && !(value instanceof Date))) {
    return null;
  }
  const d = new Date(value as string);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
}

async function requesterHasShiftOnDay(
  userId: string,
  dayOfWeek: number,
  shift: number,
  pos: number,
): Promise<boolean> {
  const schedule = await Schedule.findOne({
    userId,
    isActive: true,
    schedules: {
      $elemMatch: { dayOfWeek, shifts: shift, pos },
    },
  });
  return !!schedule;
}

// @route   POST /api/shift-coverages
// @desc    Create a coverage request (requester asks target to cover their shift)
// @access  Private (User)
export const createCoverageRequest = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const requesterId = req.user?.userId;
    const { targetUserId, date, shift, pos, reason } = req.body;

    if (!requesterId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    if (!targetUserId || !mongoose.isValidObjectId(targetUserId)) {
      res
        .status(400)
        .json({ success: false, message: "Invalid targetUserId" });
      return;
    }
    if (targetUserId === requesterId) {
      res.status(400).json({
        success: false,
        message: "Tidak bisa meminta diri sendiri",
      });
      return;
    }

    const normalizedDate = normalizeDate(date);
    if (!normalizedDate) {
      res.status(400).json({ success: false, message: "Tanggal tidak valid" });
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (normalizedDate.getTime() < today.getTime()) {
      res.status(400).json({
        success: false,
        message: "Tanggal tidak boleh di masa lalu",
      });
      return;
    }

    if (!isValidShift(shift) || !isValidPos(pos)) {
      res.status(400).json({
        success: false,
        message: "Shift harus 1-5, pos harus 1 atau 2",
      });
      return;
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      res
        .status(404)
        .json({ success: false, message: "Target user tidak ditemukan" });
      return;
    }
    if (targetUser.role === "admin") {
      res.status(400).json({
        success: false,
        message: "Target tidak boleh admin",
      });
      return;
    }

    // Requester must actually have this shift in their active schedule
    const dayOfWeek = normalizedDate.getDay();
    const hasShift = await requesterHasShiftOnDay(
      requesterId,
      dayOfWeek,
      shift,
      pos,
    );
    if (!hasShift) {
      res.status(400).json({
        success: false,
        message:
          "Anda tidak punya shift tersebut di hari tanggal yang dipilih",
      });
      return;
    }

    // Prevent duplicate pending requests for the same (requester, date, shift, pos).
    // Cast through Record because Mongoose v9 narrows the filter to query helpers
    // when mixing scalar + ref fields; the runtime shape is plain and safe.
    const duplicate = await ShiftCoverage.findOne({
      requesterId,
      date: normalizedDate,
      shift: shift as ShiftNumber,
      pos: pos as PosNumber,
      status: "pending",
    } as Record<string, unknown>);
    if (duplicate) {
      res.status(400).json({
        success: false,
        message:
          "Sudah ada permintaan pengganti yang masih pending untuk shift ini",
      });
      return;
    }

    const coverage = await ShiftCoverage.create({
      requesterId,
      targetUserId,
      date: normalizedDate,
      shift: shift as ShiftNumber,
      pos: pos as PosNumber,
      reason: reason || undefined,
      status: "pending",
    });

    const populated = await ShiftCoverage.findById(coverage._id).populate(
      POPULATE_USERS as never,
    );

    res.status(201).json({ success: true, data: populated });
  },
);

// @route   GET /api/shift-coverages/incoming
// @desc    Coverage requests directed at me
// @access  Private (User)
export const listIncoming = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    const coverages = await ShiftCoverage.find({ targetUserId: userId })
      .sort({ createdAt: -1 })
      .populate(POPULATE_USERS as never);
    res.status(200).json({ success: true, data: coverages });
  },
);

// @route   GET /api/shift-coverages/outgoing
// @desc    Coverage requests I created
// @access  Private (User)
export const listOutgoing = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    const coverages = await ShiftCoverage.find({ requesterId: userId })
      .sort({ createdAt: -1 })
      .populate(POPULATE_USERS as never);
    res.status(200).json({ success: true, data: coverages });
  },
);

// @route   POST /api/shift-coverages/:id/approve
// @desc    Target user accepts to cover the shift
// @access  Private (User)
export const approveCoverage = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    const { id } = req.params;

    const coverage = await ShiftCoverage.findById(id);
    if (!coverage) {
      res
        .status(404)
        .json({ success: false, message: "Permintaan tidak ditemukan" });
      return;
    }
    if (String(coverage.targetUserId) !== userId) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }
    if (coverage.status !== "pending") {
      res.status(400).json({
        success: false,
        message: `Permintaan sudah ${coverage.status}`,
      });
      return;
    }

    coverage.status = "approved";
    coverage.respondedAt = new Date();
    await coverage.save();

    const populated = await ShiftCoverage.findById(coverage._id).populate(
      POPULATE_USERS as never,
    );

    res.status(200).json({ success: true, data: populated });
  },
);

// @route   POST /api/shift-coverages/:id/reject
// @desc    Target user declines to cover
// @access  Private (User)
export const rejectCoverage = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    const { id } = req.params;

    const coverage = await ShiftCoverage.findById(id);
    if (!coverage) {
      res
        .status(404)
        .json({ success: false, message: "Permintaan tidak ditemukan" });
      return;
    }
    if (String(coverage.targetUserId) !== userId) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }
    if (coverage.status !== "pending") {
      res.status(400).json({
        success: false,
        message: `Permintaan sudah ${coverage.status}`,
      });
      return;
    }

    coverage.status = "rejected";
    coverage.respondedAt = new Date();
    await coverage.save();

    res.status(200).json({ success: true, data: coverage });
  },
);

// @route   POST /api/shift-coverages/:id/cancel
// @desc    Requester cancels their pending request
// @access  Private (User)
export const cancelCoverage = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    const { id } = req.params;

    const coverage = await ShiftCoverage.findById(id);
    if (!coverage) {
      res
        .status(404)
        .json({ success: false, message: "Permintaan tidak ditemukan" });
      return;
    }
    if (String(coverage.requesterId) !== userId) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }
    if (coverage.status !== "pending") {
      res.status(400).json({
        success: false,
        message: `Permintaan sudah ${coverage.status}`,
      });
      return;
    }

    coverage.status = "cancelled";
    coverage.respondedAt = new Date();
    await coverage.save();

    res.status(200).json({ success: true, data: coverage });
  },
);
