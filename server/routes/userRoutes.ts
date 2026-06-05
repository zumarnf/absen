import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  deleteUser,
  getUsersForSelect,
} from "../controllers/userController";
import { authenticate } from "../middleware/auth";
import { roleCheck } from "../middleware/roleCheck";

const router = Router();

// All routes require authentication; admin gate applied selectively below.
router.use(authenticate);

// @route   GET /api/users/select
// @desc    Minimal user list for dropdowns (any authenticated user)
// @access  Private (any user)
router.get("/select", getUsersForSelect);

// Admin-only routes below
router.use(roleCheck("admin"));

// @route   GET /api/users/all
// @desc    Get all users
// @access  Private (Admin)
router.get("/all", getAllUsers);

// @route   GET /api/users/:userId
// @desc    Get user by ID
// @access  Private (Admin)
router.get("/:userId", getUserById);

// @route   DELETE /api/users/:userId
// @desc    Delete user and all related data
// @access  Private (Admin)
router.delete("/:userId", deleteUser);

export default router;
