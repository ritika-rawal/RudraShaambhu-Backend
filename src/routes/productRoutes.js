import { Router } from "express";
import { getProductById, getProducts } from "../controllers/productController.js";

const router = Router();

router.get("/", getProducts);
router.get("/:productId", getProductById);

export default router;
