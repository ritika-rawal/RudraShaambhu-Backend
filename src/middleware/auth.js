import { User } from "../models/User.js";
import { verifyAuthToken } from "../utils/auth.js";

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "missing authorization token" });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = verifyAuthToken(token);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "invalid token" });
    }

    req.authUser = user;
    return next();
  } catch {
    return res.status(401).json({ message: "invalid or expired token" });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.authUser || req.authUser.role !== "admin") {
    return res.status(403).json({ message: "admin access required" });
  }

  return next();
}
