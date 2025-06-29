import { Router } from "express";
import { uploadTransactions, getTransactionsByUser } from "../controllers/transaction.controller";
import { verifyToken } from "../middleware/auth.middleware";

const router = Router();

router.post("/upload", verifyToken, uploadTransactions);
router.get("/user", verifyToken, getTransactionsByUser);

export default router;
