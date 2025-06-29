import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: string;
}

export const verifyToken: RequestHandler = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "Access Denied. No token provided." });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    (req as AuthRequest).userId = decoded.userId; // ✅ Cast req to AuthRequest
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid token" });
    return;
  }
};
