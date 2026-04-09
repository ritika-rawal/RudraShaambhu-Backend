import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User", index: true },
    items: { type: [orderItemSchema], required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    shippingAddress: { type: String, required: true, trim: true },
    status: { type: String, enum: ["pending", "completed"], default: "pending" }
  },
  {
    versionKey: false,
    timestamps: true,
    collection: "orders"
  }
);

orderSchema.index({ userId: 1, createdAt: -1 });

export const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
