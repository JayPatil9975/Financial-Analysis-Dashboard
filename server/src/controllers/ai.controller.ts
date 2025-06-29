import { Request, Response } from "express";
import axios from "axios";

export const analyzeTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const question = req.body.question;
    const transactions = req.body.transactions;
    if (!question || typeof question !== "string") {
      res.status(400).json({ message: "Missing or invalid question" });
      return;
    }
    if (!Array.isArray(transactions) || transactions.length === 0) {
      res.status(400).json({ message: "No transactions provided" });
      return;
    }

    // Limit to first 20 transactions for prompt size
    const sampleTransactions = transactions.slice(0, 20);

    const prompt = `
You are a financial analyst AI. The user asked: "${question}"
Analyze the following sample of their transaction data and answer the user's question. If the question is general, provide a concise summary including:
- Total income and expenses
- Biggest spending categories
- Any unusual patterns or suggestions

Transactions:
${JSON.stringify(sampleTransactions, null, 2)}
(Only a sample is shown. Answer based on this sample.)
`;

    const togetherApiKey = process.env.TOGETHER_API_KEY;
    const togetherRes = await axios.post(
      "https://api.together.xyz/v1/chat/completions",
      {
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 400,
        temperature: 0.7,
      },
      {
        headers: {
          "Authorization": `Bearer ${togetherApiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const aiSummary = togetherRes.data.choices[0].message.content;
    res.json({ summary: aiSummary });
  } catch (err: any) {
    console.error("Together AI API error:", err?.response?.data || err);
    res.status(500).json({ message: "AI analysis failed", error: err?.response?.data });
  }
};
