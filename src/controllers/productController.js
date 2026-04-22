import { Product } from "../models/Product.js";
import mongoose from "mongoose";

const ADMIN_EMAIL = String(process.env.ADMIN_EMAIL || "admin@gmail.com").toLowerCase();

function toPayload(product) {
  const json = product.toJSON();
  return {
    ...json,
    id: json.id ?? json._id,
    mukhi: String(json.mukhi)
  };
}

export async function getProducts(req, res) {
  const rawMukhi = typeof req.query.mukhi === "string" ? req.query.mukhi : "";
  const mukhiDigits = rawMukhi.replace(/\D/g, "");
  const mukhiParam = mukhiDigits ? Number(mukhiDigits) : null;
  const query = {};

  if (Number.isInteger(mukhiParam)) {
    // Support legacy records where mukhi may be stored as either number or string.
    query.mukhi = { $in: [mukhiParam, String(mukhiParam)] };
  }

  try {
    const items = await Product.find(query).sort({ mukhi: 1, rating: -1 });
    return res.json({ items: items.map(toPayload) });
  } catch (error) {
    return res.status(500).json({ message: "failed to load products", error: error.message });
  }
}

export async function getProductById(req, res) {
  const { productId } = req.params;

  try {
    let item = null;

    if (mongoose.Types.ObjectId.isValid(productId)) {
      item = await Product.findById(productId);
    }

    if (!item) {
      const numericId = Number(productId);
      if (Number.isInteger(numericId)) {
        item = await Product.findOne({ id: numericId });
      }
    }

    if (!item) {
      return res.status(404).json({ message: "product not found" });
    }

    return res.json({ item: toPayload(item) });
  } catch (error) {
    return res.status(500).json({ message: "failed to load product", error: error.message });
  }
}

export async function updateProductPriceForAdmin(req, res) {
  const adminEmail = String(req.body.adminEmail || req.query.adminEmail || req.headers["x-admin-email"] || "")
    .trim()
    .toLowerCase();

  if (!adminEmail || adminEmail !== ADMIN_EMAIL) {
    return res.status(403).json({ message: "admin access denied" });
  }

  const productId = String(req.body.productId || "").trim();
  const rawMukhi = String(req.body.mukhi || "").trim();
  const price = Number(req.body.price);

  if (!Number.isFinite(price) || price < 0) {
    return res.status(400).json({ message: "price must be a valid non-negative number" });
  }

  try {
    let item = null;

    if (productId) {
      if (mongoose.Types.ObjectId.isValid(productId)) {
        item = await Product.findById(productId);
      }

      if (!item) {
        const numericId = Number(productId);
        if (Number.isInteger(numericId)) {
          item = await Product.findOne({ id: numericId });
        }
      }
    }

    if (!item && rawMukhi) {
      const mukhiDigits = rawMukhi.replace(/\D/g, "");
      const mukhiNumber = Number(mukhiDigits);
      if (Number.isInteger(mukhiNumber)) {
        item = await Product.findOne({ mukhi: { $in: [mukhiNumber, String(mukhiNumber)] } });
      }
    }

    if (!item) {
      return res.status(404).json({ message: "product not found" });
    }

    item.price = Number(price.toFixed(2));
    await item.save();

    return res.json({ item: toPayload(item) });
  } catch (error) {
    return res.status(500).json({ message: "failed to update product price", error: error.message });
  }
}
