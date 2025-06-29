import { Router } from "express";
import { analyzeTransactions } from "../controllers/ai.controller";
import { verifyToken } from "../middleware/auth.middleware";

const router = Router();
router.post("/analyze", verifyToken, analyzeTransactions);

export default router;