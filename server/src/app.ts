import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Allow only your frontend domain
app.use(cors({
  origin: [
    "https://financial-analysis-dashboard-01.onrender.com",
    "http://localhost:3000",
  ],
  credentials: true,
}));

app.use(express.json());

import authRoutes from "./routes/auth.routes";
import transactionRoutes from "./routes/transaction.routes";
import aiRoutes from "./routes/ai.routes";

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/ai", aiRoutes);

export default app;
