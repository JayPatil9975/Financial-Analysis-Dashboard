import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  status: { type: String, required: true },
  user_profile: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

export default mongoose.model("Transaction", TransactionSchema);
