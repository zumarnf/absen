import dotenv from "dotenv";
import connectDB from "./config/database";
import { setupAttendanceReset } from "./utils/cronJobs";
import { createApp } from "./app";

// Load environment variables
dotenv.config();

// Build the Express application
const app = createApp();

// Connect to database
connectDB();

// Setup cron jobs
setupAttendanceReset();

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("=================================");
  console.log(`Server started on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log("=================================");
});

export default app;
