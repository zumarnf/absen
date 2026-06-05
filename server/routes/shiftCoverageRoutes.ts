import { Router } from "express";
import {
  approveCoverage,
  cancelCoverage,
  createCoverageRequest,
  listIncoming,
  listOutgoing,
  rejectCoverage,
} from "../controllers/shiftCoverageController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.post("/", createCoverageRequest);
router.get("/incoming", listIncoming);
router.get("/outgoing", listOutgoing);
router.post("/:id/approve", approveCoverage);
router.post("/:id/reject", rejectCoverage);
router.post("/:id/cancel", cancelCoverage);

export default router;
