import { Request, Response, NextFunction, RequestHandler } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { AuthRequest } from "../middleware/auth.middleware";

// Register Controller
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ email, password: hashedPassword });

    res.status(201).json({ message: "User created", userId: newUser._id });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Login Controller
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "1d",
    });

    res.status(200).json({ token, userId: user._id });
    console.log("JWT:", token);
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GetMe Controller
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const user = await User.findById(userId).select("email");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({ email: user.email });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

