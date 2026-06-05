import { Router } from "express";
import { subscribe } from "../controllers/streamController";
import { authenticate } from "../middleware/auth";
import { requireAdmin } from "../middleware/roleCheck";

const router = Router();

// Admin-only realtime event stream
router.get("/events", authenticate, requireAdmin, subscribe);

export default router;
