import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    image: {
      type: String,
      default: ""
    },
    provider: {
      type: String,
      enum: ["google", "apple", "credentials"],
      required: true
    },
    // OAuth Provider IDs
    googleId: {
      type: String,
      unique: true,
      sparse: true
    },
    appleId: {
      type: String,
      unique: true,
      sparse: true
    },
    // For credentials provider
    password: {
      type: String,
      default: null
    },
    // Account verification
    emailVerified: {
      type: Boolean,
      default: false
    },
    verificationToken: {
      type: String,
      default: null
    },
    // User preferences
    preferences: {
      newsletter: { type: Boolean, default: false },
      notifications: { type: Boolean, default: true }
    },
    // Last login
    lastLogin: {
      type: Date,
      default: null
    }
  },
  {
    versionKey: false,
    timestamps: true,
    collection: "users"
  }
);

// Indexes for OAuth Ids
userSchema.index({ googleId: 1 }, { unique: true, sparse: true });
userSchema.index({ appleId: 1 }, { unique: true, sparse: true });
userSchema.index({ email: 1 }, { unique: true });

export const User = mongoose.models.User || mongoose.model("User", userSchema);
