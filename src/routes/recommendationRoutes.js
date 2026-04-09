import { Router } from "express";
import {
  getDobRecommendation,
  getExploreRecommendation,
  getNameRecommendation,
  getNumerologyRecommendation
} from "../controllers/recommendationController.js";

const router = Router();

router.get("/name", getNameRecommendation);
router.get("/dob", getDobRecommendation);
router.get("/numerology", getNumerologyRecommendation);
router.get("/explore", getExploreRecommendation);

export default router;
