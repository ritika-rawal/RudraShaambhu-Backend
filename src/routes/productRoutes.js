import { Router } from "express";
import { getProductById, getProducts, updateProductPriceForAdmin } from "../controllers/productController.js";

const router = Router();

router.get("/", getProducts);
router.patch("/admin/price", updateProductPriceForAdmin);
router.get("/:productId", getProductById);

export default router;
