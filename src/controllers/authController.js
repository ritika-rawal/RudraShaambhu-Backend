import { User } from "../models/User.js";

function normalizePayload(body = {}) {
  return {
    name: String(body.name || "").trim(),
    email: String(body.email || "").trim().toLowerCase(),
    image: String(body.image || "").trim()
  };
}

function isEmail(value) {
  return /^\S+@\S+\.\S+$/.test(value);
}

export function socialAuth(provider) {
  return async function handleSocialAuth(req, res) {
    const payload = normalizePayload(req.body);

    if (!payload.name || !payload.email) {
      return res.status(400).json({ message: "name and email are required" });
    }

    if (!isEmail(payload.email)) {
      return res.status(400).json({ message: "invalid email format" });
    }

    try {
      const user = await User.findOneAndUpdate(
        { email: payload.email },
        {
          $set: {
            name: payload.name,
            image: payload.image,
            provider
          },
          $setOnInsert: {
            createdAt: new Date()
          }
        },
        { upsert: true, new: true, runValidators: true }
      );

      return res.status(200).json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          image: user.image,
          provider: user.provider,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      return res.status(500).json({ message: "failed to authenticate user", error: error.message });
    }
  };
}

export async function guestAuth(req, res) {
  const payload = normalizePayload(req.body);

  if (!payload.name || !payload.email) {
    return res.status(400).json({ message: "name and email are required" });
  }

  if (!isEmail(payload.email)) {
    return res.status(400).json({ message: "invalid email format" });
  }

  try {
    const user = await User.findOneAndUpdate(
      { email: payload.email },
      {
        $set: {
          name: payload.name,
          image: payload.image,
          provider: "guest"
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: true, new: true, runValidators: true }
    );

    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        provider: user.provider,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "failed to authenticate guest user", error: error.message });
  }
}
