import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/database";
import { setupAttendanceReset } from "./utils/cronJobs";
import { apiLimiter } from "./middleware/rateLimiter";

// Import routes
import authRoutes from "./routes/authRoutes";
import attendanceRoutes from "./routes/attendanceRoutes";
import scheduleRoutes from "./routes/scheduleRoutes";
import courseRoutes from "./routes/courseRoutes";
import userRoutes from "./routes/userRoutes";
import streamRoutes from "./routes/streamRoutes";
import shiftCoverageRoutes from "./routes/shiftCoverageRoutes";

// Load environment variables
dotenv.config();

// Initialize express app
const app: Application = express();

// Connect to database
connectDB();

// Setup cron jobs
setupAttendanceReset();

// Middleware
// Security headers (also removes the X-Powered-By fingerprint)
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Rate limiting for the whole API surface (basic flood/DoS mitigation)
app.use("/api", apiLimiter);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/users", userRoutes);
app.use("/api/stream", streamRoutes);
app.use("/api/shift-coverages", shiftCoverageRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handler (must have 4 params for Express to recognize it)
app.use(
  (
    err: Error & { status?: number; code?: number },
    _req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    console.error("Error:", err.message);

    // Map known operational errors to 400 without leaking DB internals
    if (err.name === "CastError") {
      res.status(400).json({ success: false, message: "Invalid ID format" });
      return;
    }
    if (err.name === "ValidationError") {
      res.status(400).json({ success: false, message: err.message });
      return;
    }
    if (err.code === 11000) {
      res.status(400).json({ success: false, message: "Duplicate entry" });
      return;
    }

    const status = err.status || 500;
    res.status(status).json({
      success: false,
      // Never echo raw internal error messages on unexpected 5xx errors
      message:
        status >= 500 ? "Internal server error" : err.message || "Bad request",
      error: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  },
);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("=================================");
  console.log(`Server started on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log("=================================");
});

export default app;
