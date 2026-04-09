import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, sparse: true, index: true },
    mukhi: { type: Number, required: true, index: true, min: 1 },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    desc: { type: String, required: true },
    benefits: { type: [String], default: [] },
    rating: { type: Number, required: true, min: 0, max: 5 },
    image: { type: String, default: "" }
  },
  {
    versionKey: false,
    timestamps: true,
    collection: "products"
  }
);

export const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
