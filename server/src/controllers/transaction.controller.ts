import { RequestHandler } from "express";
import Transaction from "../models/Transaction";
import { AuthRequest } from "../middleware/auth.middleware";
import { Request, Response } from "express";


export const uploadTransactions: RequestHandler = async (req, res) => {
  try {
    const userId = (req as AuthRequest).userId;
    const transactions = req.body;

    if (!Array.isArray(transactions)) {
      res.status(400).json({ message: "Invalid format, expected array" });
      return;
    }

    const formattedData = transactions.map((t) => ({
      date: t.date,
      amount: t.amount,
      category: t.category,
      status: t.status,
      user_profile: t.user_profile,
      user: userId,
    }));

    await Transaction.insertMany(formattedData);

    res.status(201).json({ message: "Transactions uploaded successfully" });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    res.status(500).json({ message: "Failed to upload transactions" });
  }
};

export const getTransactionsByUser = async (req: Request & AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const transactions = await Transaction.find({ user: userId });
    res.status(200).json(transactions);
  } catch (error) {
    console.error("FETCH ERROR:", error);
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
};