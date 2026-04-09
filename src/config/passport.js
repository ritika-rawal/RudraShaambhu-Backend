import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as AppleStrategy } from "passport-apple";
import { User } from "../models/User.js";

/**
 * Google OAuth Strategy
 * Authenticates users via Google OAuth 2.0
 */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Prepare user data from Google profile
        const userData = {
          googleId: profile.id,
          email: profile.emails?.[0]?.value,
          name: profile.displayName,
          image: profile.photos?.[0]?.value,
          provider: "google",
          emailVerified: true,
          lastLogin: new Date()
        };

        // Find existing user by googleId
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // Update existing user
          user = await User.findByIdAndUpdate(user._id, userData, { new: true });
        } else {
          // Check if email already exists with different provider
          const existingByEmail = await User.findOne({ email: userData.email });

          if (existingByEmail) {
            // Email already exists - could merge accounts or return error
            // For security, we'll return error asking user to sign in with original provider
            return done(null, false, {
              message: "Email already registered with another provider"
            });
          }

          // Create new user
          user = new User(userData);
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        console.error("Google OAuth Error:", error);
        return done(error);
      }
    }
  )
);

/**
 * Apple OAuth Strategy
 * Authenticates users via Sign in with Apple
 */
passport.use(
  new AppleStrategy(
    {
      teamID: process.env.APPLE_TEAM_ID,
      keyID: process.env.APPLE_KEY_ID,
      bundleID: process.env.APPLE_SERVICE_ID,
      callbackURL: process.env.APPLE_CALLBACK_URL || "http://localhost:5000/api/auth/apple/callback",
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, idToken, profile, done) => {
      try {
        // Prepare user data from Apple profile
        const userData = {
          appleId: profile.id,
          email: profile.email || (profile.emails && profile.emails[0]?.value),
          name: profile.name?.firstName
            ? `${profile.name.firstName} ${profile.name.lastName || ""}`.trim()
            : profile.displayName || "Apple User",
          provider: "apple",
          emailVerified: true,
          lastLogin: new Date()
        };

        // Find existing user by appleId
        let user = await User.findOne({ appleId: profile.id });

        if (user) {
          // Update existing user
          user = await User.findByIdAndUpdate(user._id, userData, { new: true });
        } else {
          // Check if email already exists
          const existingByEmail = await User.findOne({ email: userData.email });

          if (existingByEmail) {
            // Email already exists with different provider
            return done(null, false, {
              message: "Email already registered with another provider"
            });
          }

          // Create new user
          user = new User(userData);
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        console.error("Apple OAuth Error:", error);
        return done(error);
      }
    }
  )
);

/**
 * Serialize user - store minimal data in session
 */
passport.serializeUser((user, done) => {
  done(null, user._id);
});

/**
 * Deserialize user - retrieve user from session
 */
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
