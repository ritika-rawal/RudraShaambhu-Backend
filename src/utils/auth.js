import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const DEFAULT_TOKEN_TTL = "7d";

export function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export function comparePassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

export function signAuthToken(payload) {
  const jwtSecret = process.env.JWT_SECRET || "change-this-secret";
  const tokenTtl = process.env.JWT_EXPIRES_IN || DEFAULT_TOKEN_TTL;

  return jwt.sign(payload, jwtSecret, { expiresIn: tokenTtl });
}

export function verifyAuthToken(token) {
  const jwtSecret = process.env.JWT_SECRET || "change-this-secret";
  return jwt.verify(token, jwtSecret);
}
