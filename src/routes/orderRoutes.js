import { Router } from "express";
import { createOrder, getAllOrdersForAdmin, getOrdersByUser } from "../controllers/orderController.js";

const router = Router();

router.post("/create", createOrder);
router.get("/admin/all", getAllOrdersForAdmin);
router.get("/:userId", getOrdersByUser);

export default router;
