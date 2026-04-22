import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    productSnapshot: {
      name: { type: String, trim: true, default: "" },
      mukhi: { type: String, trim: true, default: "" },
      price: { type: Number, min: 0, default: 0 },
      image: { type: String, default: "" }
    }
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    userSnapshot: {
      name: { type: String, trim: true, default: "" },
      email: { type: String, trim: true, lowercase: true, default: "" },
      provider: { type: String, trim: true, default: "" }
    },
    items: { type: [cartItemSchema], default: [] }
  },
  {
    versionKey: false,
    timestamps: true,
    collection: "carts"
  }
);

export const Cart = mongoose.models.Cart || mongoose.model("Cart", cartSchema);
