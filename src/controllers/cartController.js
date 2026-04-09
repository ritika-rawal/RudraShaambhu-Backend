import mongoose from "mongoose";
import { Cart } from "../models/Cart.js";
import { Product } from "../models/Product.js";

function isObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }

  return cart;
}

async function toCartResponse(cart) {
  await cart.populate("items.productId");

  const items = cart.items
    .filter((entry) => entry.productId)
    .map((entry) => {
      const product = entry.productId;
      const lineTotal = Number((product.price * entry.quantity).toFixed(2));

      return {
        product: {
          id: product.id ?? product._id,
          _id: product._id,
          name: product.name,
          price: product.price,
          desc: product.desc,
          mukhi: String(product.mukhi),
          image: product.image,
          benefits: product.benefits,
          rating: product.rating
        },
        quantity: entry.quantity,
        lineTotal
      };
    });

  const totalAmount = Number(items.reduce((sum, entry) => sum + entry.lineTotal, 0).toFixed(2));

  return {
    userId: cart.userId,
    items,
    totalAmount
  };
}

export async function getCart(req, res) {
  const { userId } = req.params;

  if (!isObjectId(userId)) {
    return res.status(400).json({ message: "invalid userId" });
  }

  try {
    const cart = await getOrCreateCart(userId);
    const payload = await toCartResponse(cart);
    return res.json(payload);
  } catch (error) {
    return res.status(500).json({ message: "failed to load cart", error: error.message });
  }
}

export async function addToCart(req, res) {
  const userId = String(req.body.userId || "");
  const productId = String(req.body.productId || "");
  const quantity = Math.max(Number(req.body.quantity) || 1, 1);

  if (!isObjectId(userId) || !isObjectId(productId)) {
    return res.status(400).json({ message: "invalid userId or productId" });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "product not found" });
    }

    const cart = await getOrCreateCart(userId);
    const existing = cart.items.find((entry) => String(entry.productId) === productId);

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();
    const payload = await toCartResponse(cart);
    return res.status(201).json(payload);
  } catch (error) {
    return res.status(500).json({ message: "failed to add item to cart", error: error.message });
  }
}

export async function removeFromCart(req, res) {
  const userId = String(req.body.userId || "");
  const productId = String(req.body.productId || "");

  if (!isObjectId(userId) || !isObjectId(productId)) {
    return res.status(400).json({ message: "invalid userId or productId" });
  }

  try {
    const cart = await getOrCreateCart(userId);
    cart.items = cart.items.filter((entry) => String(entry.productId) !== productId);
    await cart.save();

    const payload = await toCartResponse(cart);
    return res.json(payload);
  } catch (error) {
    return res.status(500).json({ message: "failed to remove item", error: error.message });
  }
}

export async function updateCartItem(req, res) {
  const userId = String(req.body.userId || "");
  const productId = String(req.body.productId || "");
  const quantity = Number(req.body.quantity);

  if (!isObjectId(userId) || !isObjectId(productId)) {
    return res.status(400).json({ message: "invalid userId or productId" });
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({ message: "quantity must be an integer greater than 0" });
  }

  try {
    const cart = await getOrCreateCart(userId);
    const target = cart.items.find((entry) => String(entry.productId) === productId);

    if (!target) {
      return res.status(404).json({ message: "cart item not found" });
    }

    target.quantity = quantity;
    await cart.save();

    const payload = await toCartResponse(cart);
    return res.json(payload);
  } catch (error) {
    return res.status(500).json({ message: "failed to update cart item", error: error.message });
  }
}
