import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User";
import Attendance from "../models/Attendance";
import Schedule from "../models/Schedule";
import CourseSchedule from "../models/CourseSchedule";
import ShiftCoverage from "../models/ShiftCoverage";

dotenv.config();

const seedUsers = async () => {
  try {
    // Connect to database
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/absensi_logistik";
    await mongoose.connect(mongoURI);
    console.log("✅ MongoDB Connected");

    // Cascade clear: deleting users alone leaves orphan refs (Attendance,
    // Schedule, CourseSchedule, ShiftCoverage) which then render as
    // "Unknown User" in the UI because populate() can't find the referenced doc.
    await Promise.all([
      Attendance.deleteMany({}),
      Schedule.deleteMany({}),
      CourseSchedule.deleteMany({}),
      ShiftCoverage.deleteMany({}),
      User.deleteMany({}),
    ]);
    console.log("🗑️  Cleared users + all dependent collections");

    // Create Admin
    const admin = await User.create({
      username: "admin",
      password: "admin123",
      nama: "Administrator",
      role: "admin",
    });
    console.log("✅ Admin created:", admin.username);

    // Create User 1
    const user1 = await User.create({
      username: "budi",
      password: "budi123",
      nama: "Budi Santoso",
      role: "user",
    });
    console.log("✅ User 1 created:", user1.username);

    // Create User 2
    const user2 = await User.create({
      username: "siti",
      password: "siti123",
      nama: "Siti Nurhaliza",
      role: "user",
    });
    console.log("✅ User 2 created:", user2.username);

    // Create User 3
    const user3 = await User.create({
      username: "andi",
      password: "andi123",
      nama: "Andi Wijaya",
      role: "user",
    });
    console.log("✅ User 3 created:", user3.username);

    console.log("\n=================================");
    console.log("🎉 Seeding completed successfully!");
    console.log("=================================");
    console.log("📋 Login Credentials:");
    console.log("");
    console.log("Admin:");
    console.log("  Username: admin");
    console.log("  Password: admin123");
    console.log("");
    console.log("Users:");
    console.log("  Username: budi   | Password: budi123");
    console.log("  Username: siti   | Password: siti123");
    console.log("  Username: andi   | Password: andi123");
    console.log("=================================");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
};

seedUsers();
