import { Router } from "express";
import { addToCart, getCart, removeFromCart, updateCartItem } from "../controllers/cartController.js";

const router = Router();

router.get("/:userId", getCart);
router.post("/add", addToCart);
router.post("/remove", removeFromCart);
router.post("/update", updateCartItem);

export default router;
