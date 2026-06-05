import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { AuthRequest, LoginCredentials, RegisterData } from "../types";
import { asyncHandler } from "../middleware/asyncHandler";
import { getJwtSecret, getJwtExpiresIn } from "../utils/jwt";

// Generate JWT Token
const generateToken = (
  userId: string,
  username: string,
  role: "admin" | "user",
): string => {
  return jwt.sign({ userId, username, role }, getJwtSecret(), {
    expiresIn: getJwtExpiresIn(),
  });
};

// Helper to format user response (avoid repeating field selection)
const formatUserResponse = (user: {
  _id: unknown;
  username: string;
  nama: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  _id: user._id,
  username: user.username,
  nama: user.nama,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
export const register = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { username, password, nama, role }: RegisterData = req.body;

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      typeof nama !== "string" ||
      !username ||
      !password ||
      !nama
    ) {
      res.status(400).json({
        success: false,
        message: "Please provide username, password, and nama",
      });
      return;
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "Username already exists",
      });
      return;
    }

    const user = await User.create({
      username,
      password,
      nama,
      role: role || "user",
    });

    const token = generateToken(user._id.toString(), user.username, user.role);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: { token, user: formatUserResponse(user) },
    });
  },
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
export const login = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { username, password }: LoginCredentials = req.body;

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !username ||
      !password
    ) {
      res.status(400).json({
        success: false,
        message: "Please provide username and password",
      });
      return;
    }

    const user = await User.findOne({ username }).select("+password");
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    const token = generateToken(user._id.toString(), user.username, user.role);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: { token, user: formatUserResponse(user) },
    });
  },
);

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
export const getProfile = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const user = await User.findById(req.user?.userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: formatUserResponse(user),
    });
  },
);

// @route   GET /api/auth/verify
// @desc    Verify JWT token
// @access  Private
export const verifyToken = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    res.status(200).json({
      success: true,
      message: "Token is valid",
      data: { user: req.user },
    });
  },
);
