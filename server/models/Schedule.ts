import mongoose, { Schema } from "mongoose";
import { ISchedule } from "../types";

const scheduleShiftSchema = new Schema(
  {
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
    },
    shifts: {
      type: [Number],
      required: true,
      validate: {
        validator: function (shifts: number[]) {
          return shifts.every((shift) => shift >= 1 && shift <= 5);
        },
        message: "Shifts must be between 1 and 5",
      },
    },
    pos: {
      type: Number,
      required: true,
      enum: [1, 2],
      default: 1,
    },
  },
  { _id: false }
);

const scheduleSchema = new Schema<ISchedule>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    schedules: {
      type: [scheduleShiftSchema],
      required: true,
      validate: {
        validator: function (schedules: any[]) {
          // Cek tidak ada dayOfWeek yang duplicate
          const days = schedules.map((s) => s.dayOfWeek);
          return days.length === new Set(days).size;
        },
        message: "Duplicate day of week found in schedules",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index untuk mencegah multiple active schedule per user
scheduleSchema.index({ userId: 1, isActive: 1 });

// Static method untuk validasi maksimal 3 user per shift per pos
scheduleSchema.statics.validateShiftCapacity = async function (
  dayOfWeek: number,
  shift: number,
  pos: number,
  excludeUserId?: string
) {
  const query: any = {
    isActive: true,
    "schedules.dayOfWeek": dayOfWeek,
    "schedules.shifts": shift,
    "schedules.pos": pos,
  };

  if (excludeUserId) {
    query.userId = { $ne: excludeUserId };
  }

  const count = await this.countDocuments(query);
  return count < 3; // Maksimal 3 user per shift per pos
};

const Schedule = mongoose.model<ISchedule>("Schedule", scheduleSchema);

export default Schedule;
