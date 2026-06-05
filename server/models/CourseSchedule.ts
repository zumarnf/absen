import mongoose, { Schema } from "mongoose";
import { ICourseSchedule } from "../types";

const courseSchema = new Schema(
  {
    namaMataKuliah: {
      type: String,
      required: [true, "Nama mata kuliah is required"],
      trim: true,
    },
    hari: {
      type: Number,
      required: [true, "Hari is required"],
      min: 0,
      max: 6,
    },
    jamMulai: {
      type: String,
      required: [true, "Jam mulai is required"],
      match: [
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Jam mulai must be in HH:mm format",
      ],
    },
    jamSelesai: {
      type: String,
      required: [true, "Jam selesai is required"],
      match: [
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Jam selesai must be in HH:mm format",
      ],
    },
    ruangan: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const courseScheduleSchema = new Schema<ICourseSchedule>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    courses: {
      type: [courseSchema],
      required: true,
    },
    semester: {
      type: String,
      required: [true, "Semester is required"],
      trim: true,
    },
    tahunAjaran: {
      type: String,
      required: [true, "Tahun ajaran is required"],
      trim: true,
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

// Index untuk query yang sering digunakan
courseScheduleSchema.index({ userId: 1, isActive: 1 });
courseScheduleSchema.index({ tahunAjaran: 1, semester: 1 });

const CourseSchedule = mongoose.model<ICourseSchedule>(
  "CourseSchedule",
  courseScheduleSchema
);

export default CourseSchedule;
