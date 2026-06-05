import cron from "node-cron";
import Attendance from "../models/Attendance";

// Auto reset attendance every 15th at 23:59
export const setupAttendanceReset = () => {
  // Run at 23:59 on the 15th of every month
  cron.schedule(
    "59 23 15 * *",
    async () => {
      try {
        console.log("");
        console.log("🔄 ============================================");
        console.log("🔄 MONTHLY ATTENDANCE RESET");
        console.log("🔄 ============================================");

        const now = new Date();
        const dateStr = now.toLocaleString("id-ID", {
          timeZone: "Asia/Jakarta",
          dateStyle: "full",
          timeStyle: "medium",
        });

        console.log("📅 Reset Date:", dateStr);
        console.log("⏰ Reset Time: 23:59 WIB");
        console.log("");

        // Count records before
        const countBefore = await Attendance.countDocuments();
        console.log(`📊 Records before reset: ${countBefore}`);

        // Get statistics
        const distinctUsers = await Attendance.distinct("userId");
        const totalHours = await Attendance.aggregate([
          { $group: { _id: null, total: { $sum: "$totalHours" } } },
        ]);

        console.log(`👥 Users with attendance: ${distinctUsers.length}`);
        console.log(`⏱️  Total hours recorded: ${totalHours[0]?.total || 0}`);
        console.log("");

        // Delete all attendance records
        const result = await Attendance.deleteMany({});

        console.log("✅ RESET COMPLETE!");
        console.log(`🗑️  Deleted records: ${result.deletedCount}`);
        console.log("");
        console.log("📝 New period starts: 16th 00:00 WIB");
        console.log("📝 Next reset: 15th next month at 23:59 WIB");
        console.log("🔄 ============================================");
        console.log("");
      } catch (error) {
        console.error("");
        console.error("❌ ============================================");
        console.error("❌ ERROR DURING ATTENDANCE RESET");
        console.error("❌ ============================================");
        console.error("Error:", error);
        console.error("❌ ============================================");
        console.error("");
      }
    },
    {
      timezone: "Asia/Jakarta",
    }
  );

  console.log("⏰ Attendance auto-reset scheduled");
  console.log("   Schedule: Every 15th at 23:59 WIB");
  console.log("   Timezone: Asia/Jakarta");
  console.log("   Action: Delete all attendance records");
  console.log("");
};

// Manual reset function (for testing)
export const manualResetAttendance = async () => {
  try {
    const count = await Attendance.countDocuments();
    const result = await Attendance.deleteMany({});

    const log = {
      success: true,
      message: "Manual attendance reset successful",
      deletedCount: result.deletedCount,
      previousCount: count,
      timestamp: new Date().toISOString(),
    };

    console.log("Manual reset executed:", log);
    return log;
  } catch (error) {
    throw error;
  }
};
