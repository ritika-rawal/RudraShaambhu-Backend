import { Router } from "express";
import { createOrder, getOrdersByUser } from "../controllers/orderController.js";

const router = Router();

router.post("/create", createOrder);
router.get("/:userId", getOrdersByUser);

export default router;
