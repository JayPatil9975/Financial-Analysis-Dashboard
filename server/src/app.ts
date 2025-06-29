import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

import authRoutes from "./routes/auth.routes";
import transactionRoutes from "./routes/transaction.routes";
import aiRoutes from "./routes/ai.routes";

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/ai", aiRoutes);

export default app;
