import { Router } from "express";
import { guestAuth, socialAuth } from "../controllers/authController.js";

const router = Router();

router.post("/google", socialAuth("google"));
router.post("/apple", socialAuth("apple"));
router.post("/guest", guestAuth);

export default router;
