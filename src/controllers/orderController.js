import mongoose from "mongoose";
import { Cart } from "../models/Cart.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";

function isObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

export async function createOrder(req, res) {
  const userId = String(req.body.userId || "");
  const shipping = req.body.shipping || null;
  const shippingAddress = String(req.body.shippingAddress || "").trim();
  const checkoutItems = Array.isArray(req.body.items) ? req.body.items : [];

  if (!isObjectId(userId)) {
    return res.status(400).json({ message: "invalid userId" });
  }

  const finalShippingAddress =
    shippingAddress ||
    [shipping?.fullName, shipping?.addressLine1, shipping?.city, shipping?.state, shipping?.postalCode, shipping?.country]
      .filter(Boolean)
      .join(", ")
      .trim();

  if (!finalShippingAddress) {
    return res.status(400).json({ message: "shippingAddress is required (or provide shipping fields)" });
  }

  try {
    let items = [];
    const usingProvidedItems = checkoutItems.length > 0;

    if (usingProvidedItems) {
      const productIds = checkoutItems.map((item) => item.productId).filter((id) => isObjectId(String(id)));
      const products = await Product.find({ _id: { $in: productIds } });
      const productMap = new Map(products.map((product) => [String(product._id), product]));

      items = checkoutItems
        .map((entry) => {
          const product = productMap.get(String(entry.productId));
          const quantity = Number(entry.quantity);

          if (!product || !Number.isInteger(quantity) || quantity < 1) {
            return null;
          }

          return {
            productId: product._id,
            quantity,
            price: product.price
          };
        })
        .filter(Boolean);
    } else {
      const cart = await Cart.findOne({ userId }).populate("items.productId");

      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: "cart is empty" });
      }

      items = cart.items
        .filter((entry) => entry.productId)
        .map((entry) => ({
          productId: entry.productId._id,
          quantity: entry.quantity,
          price: entry.productId.price
        }));
    }

    if (items.length === 0) {
      return res.status(400).json({ message: "no valid items found to create order" });
    }

    const totalAmount = Number(
      items.reduce((sum, entry) => sum + entry.price * entry.quantity, 0).toFixed(2)
    );

    const order = await Order.create({
      userId,
      items,
      totalAmount,
      shippingAddress: finalShippingAddress,
      status: "pending"
    });

    await Cart.updateOne({ userId }, { $set: { items: [] } });

    return res.status(201).json({ order });
  } catch (error) {
    return res.status(500).json({ message: "failed to create order", error: error.message });
  }
}

export async function getOrdersByUser(req, res) {
  const { userId } = req.params;

  if (!isObjectId(userId)) {
    return res.status(400).json({ message: "invalid userId" });
  }

  try {
    const orders = await Order.find({ userId }).sort({ createdAt: -1 }).populate("items.productId");
    return res.json({ orders });
  } catch (error) {
    return res.status(500).json({ message: "failed to load orders", error: error.message });
  }
}
