import { User } from "../models/User.js";
import { verifyAccessToken } from "../utils/jwt.js";

/**
 * Middleware to verify JWT access token
 * Expects: Authorization: Bearer <token>
 */
export async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing authorization token" });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      provider: decoded.provider
    };
    return next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

/**
 * Legacy middleware - kept for backward compatibility
 */
export async function requireAuth(req, res, next) {
  return authenticateToken(req, res, next);
}

/**
 * Admin middleware (optional)
 * Check if user has admin role
 */
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Add your admin role check here
  // Example: if (req.user.role !== "admin")
  
  return next();
}

