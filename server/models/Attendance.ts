import mongoose, { Schema } from "mongoose";
import { IAttendance } from "../types";

const shiftAttendanceSchema = new Schema(
  {
    shift: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    pos: {
      type: Number,
      required: true,
      enum: [1, 2],
    },
  },
  { _id: false }
);

const attendanceSchema = new Schema<IAttendance>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      index: true,
    },
    shifts: {
      type: [shiftAttendanceSchema],
      required: [true, "At least one shift is required"],
      validate: {
        validator: function (shifts: { shift: number; pos: number }[]) {
          // Harus ada minimal 1 shift
          if (shifts.length === 0) return false;
          // Setiap shift harus valid
          return shifts.every(
            (s) => s.shift >= 1 && s.shift <= 5 && (s.pos === 1 || s.pos === 2)
          );
        },
        message: "Shifts must be between 1 and 5, pos must be 1 or 2",
      },
    },
    totalHours: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index untuk mencegah duplicate attendance di hari yang sama
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

// Pre-save middleware untuk menghitung total jam
attendanceSchema.pre("save", function () {
  const shiftDuration = Number(process.env.SHIFT_DURATION) || 5;
  this.totalHours = this.shifts.length * shiftDuration;
});

const Attendance = mongoose.model<IAttendance>("Attendance", attendanceSchema);

export default Attendance;
