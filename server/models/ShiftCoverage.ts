import mongoose, { Schema } from "mongoose";
import { IShiftCoverage } from "../types";

const shiftCoverageSchema = new Schema<IShiftCoverage>(
  {
    requesterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    targetUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: { type: Date, required: true, index: true },
    shift: { type: Number, required: true, min: 1, max: 5 },
    pos: { type: Number, required: true, enum: [1, 2] },
    reason: { type: String, maxlength: 500 },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
      index: true,
    },
    respondedAt: { type: Date },
  },
  { timestamps: true },
);

// Inbox/outbox query indexes
shiftCoverageSchema.index({ targetUserId: 1, status: 1, createdAt: -1 });
shiftCoverageSchema.index({ requesterId: 1, status: 1, createdAt: -1 });

const ShiftCoverage = mongoose.model<IShiftCoverage>(
  "ShiftCoverage",
  shiftCoverageSchema,
);

export default ShiftCoverage;
