import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    image: { type: String, default: "" },
    provider: { type: String, enum: ["google", "apple", "guest"], required: true }
  },
  {
    versionKey: false,
    timestamps: true,
    collection: "users"
  }
);

userSchema.index({ email: 1 }, { unique: true });

export const User = mongoose.models.User || mongoose.model("User", userSchema);
