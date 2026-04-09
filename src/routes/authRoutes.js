import express from "express";
import { User } from "../models/User.js";
import { createAuthResponse, verifyAccessToken, verifyRefreshToken } from "../utils/jwt.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * POST /api/auth/google
 * Google OAuth callback
 */
router.post("/google", async (req, res) => {
  try {
    const { name, email, image } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const userData = {
      name: name || "Google User",
      email: email.toLowerCase(),
      image: image || "",
      provider: "google",
      emailVerified: true,
      lastLogin: new Date()
    };

    // Find existing user by email
    let user = await User.findOne({ email: userData.email });

    if (user) {
      // Update existing user
      user = await User.findByIdAndUpdate(user._id, userData, { new: true });
    } else {
      // Create new user
      user = new User(userData);
      await user.save();
    }

    const authResponse = createAuthResponse(user);
    return res.status(200).json(authResponse);
  } catch (error) {
    console.error("Google auth error:", error);
    return res.status(500).json({ error: "Authentication failed" });
  }
});

/**
 * POST /api/auth/apple
 * Apple ID OAuth callback
 */
router.post("/apple", async (req, res) => {
  try {
    const { name, email, image } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const userData = {
      name: name || "Apple User",
      email: email.toLowerCase(),
      image: image || "",
      provider: "apple",
      emailVerified: true,
      lastLogin: new Date()
    };

    // Find existing user by email
    let user = await User.findOne({ email: userData.email });

    if (user) {
      // Update existing user
      user = await User.findByIdAndUpdate(user._id, userData, { new: true });
    } else {
      // Create new user
      user = new User(userData);
      await user.save();
    }

    const authResponse = createAuthResponse(user);
    return res.status(200).json(authResponse);
  } catch (error) {
    console.error("Apple auth error:", error);
    return res.status(500).json({ error: "Authentication failed" });
  }
});

/**
 * POST /api/auth/guest
 * Guest login without OAuth
 */
router.post("/guest", async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      image: "",
      provider: "credentials",
      emailVerified: false,
      lastLogin: new Date()
    };

    // Find existing user
    let user = await User.findOne({ email: userData.email });

    if (user) {
      // Update existing user
      user = await User.findByIdAndUpdate(user._id, userData, { new: true });
    } else {
      // Create new user
      user = new User(userData);
      await user.save();
    }

    const authResponse = createAuthResponse(user);
    return res.status(200).json(authResponse);
  } catch (error) {
    console.error("Guest auth error:", error);
    return res.status(500).json({ error: "Authentication failed" });
  }
});

/**
 * Verify JWT token validity
 */
router.post("/verify-token", authenticateToken, (req, res) => {
  return res.status(200).json({
    valid: true,
    user: req.user
  });
});

/**
 * GET /api/auth/me
 * Get current authenticated user info
 */
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        image: user.image,
        provider: user.provider,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error("Get user error:", error);
    return res.status(500).json({ error: "Failed to fetch user" });
  }
});

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post("/logout", authenticateToken, (req, res) => {
  return res.status(200).json({ message: "Logged out successfully" });
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token required" });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const authResponse = createAuthResponse(user);
    return res.status(200).json(authResponse);
  } catch (error) {
    return res.status(401).json({ error: "Invalid refresh token" });
  }
});

export default router;
