import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { AuthRequest, LoginCredentials, RegisterData } from "../types";
import { asyncHandler } from "../middleware/asyncHandler";
import {
  getJwtSecret,
  getJwtExpiresIn,
  getCookieMaxAgeMs,
  getAuthCookieOptions,
  AUTH_COOKIE_NAME,
} from "../utils/jwt";
import {
  CSRF_COOKIE_NAME,
  generateCsrfToken,
  getCsrfCookieOptions,
} from "../utils/csrf";

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

// Send the JWT as an httpOnly cookie so it is never exposed to client-side JS.
const setTokenCookie = (res: Response, token: string): void => {
  res.cookie(AUTH_COOKIE_NAME, token, {
    ...getAuthCookieOptions(),
    maxAge: getCookieMaxAgeMs(),
  });
};

// Issue a CSRF token in a readable cookie (double-submit pattern). The client
// echoes it back in the X-CSRF-Token header on state-changing requests.
const setCsrfCookie = (res: Response): void => {
  res.cookie(CSRF_COOKIE_NAME, generateCsrfToken(), {
    ...getCsrfCookieOptions(),
    maxAge: getCookieMaxAgeMs(),
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

    // Primary transport: httpOnly cookie. Token is still returned in the body
    // for backward compatibility, but the client no longer persists it.
    setTokenCookie(res, token);
    // Pair it with a readable CSRF token for the double-submit guard.
    setCsrfCookie(res);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: { token, user: formatUserResponse(user) },
    });
  },
);

// @route   POST /api/auth/logout
// @desc    Clear the auth cookie
// @access  Public (clearing a cookie must work even with an expired token)
export const logout = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    // Attributes must match those used when setting the cookie, otherwise the
    // browser will not remove it.
    res.clearCookie(AUTH_COOKIE_NAME, getAuthCookieOptions());
    res.clearCookie(CSRF_COOKIE_NAME, getCsrfCookieOptions());

    res.status(200).json({
      success: true,
      message: "Logout successful",
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
