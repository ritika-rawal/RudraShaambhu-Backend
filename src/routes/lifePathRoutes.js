import { Router } from "express";
import { getLifePathNumber } from "../controllers/lifePathController.js";

const router = Router();

router.post("/", getLifePathNumber);

export default router;
