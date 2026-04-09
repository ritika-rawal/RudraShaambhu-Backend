import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key_min_32_chars";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "your_refresh_secret_min_32_chars";
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "30d";

/**
 * Generate JWT access token
 * @param {Object} payload - Token payload (usually user object)
 * @returns {string} Signed JWT token
 */
export function generateAccessToken(payload) {
  try {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      algorithm: "HS256",
      issuer: "rudraksha-app",
      audience: "rudraksha-users"
    });
  } catch (error) {
    console.error("Error generating access token:", error);
    throw new Error("Failed to generate token");
  }
}

/**
 * Generate refresh token
 * @param {Object} payload - Token payload
 * @returns {string} Signed refresh token
 */
export function generateRefreshToken(payload) {
  try {
    return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
      algorithm: "HS256",
      issuer: "rudraksha-app",
      audience: "rudraksha-users"
    });
  } catch (error) {
    console.error("Error generating refresh token:", error);
    throw new Error("Failed to generate refresh token");
  }
}

/**
 * Generate both access and refresh tokens
 * @param {Object} user - User object
 * @returns {Object} Object with accessToken and refreshToken
 */
export function generateTokens(user) {
  const payload = {
    id: user._id,
    email: user.email,
    name: user.name,
    provider: user.provider
  };

  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload)
  };
}

/**
 * Verify JWT access token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: "rudraksha-app",
      audience: "rudraksha-users"
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Token has expired");
    }
    if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid token");
    }
    throw error;
  }
}

/**
 * Verify refresh token
 * @param {string} token - Refresh token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET, {
      algorithms: ["HS256"],
      issuer: "rudraksha-app",
      audience: "rudraksha-users"
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Refresh token has expired");
    }
    if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid refresh token");
    }
    throw error;
  }
}

/**
 * Create user object for token payload
 * @param {Object} user - Mongoose user document
 * @returns {Object} Safe user object for JWT
 */
export function createTokenUser(user) {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    provider: user.provider,
    image: user.image
  };
}

/**
 * Create auth response object
 * @param {Object} user - Mongoose user document
 * @returns {Object} Auth response with tokens and user info
 */
export function createAuthResponse(user) {
  const { accessToken, refreshToken } = generateTokens(user);
  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      image: user.image,
      provider: user.provider
    }
  };
}
