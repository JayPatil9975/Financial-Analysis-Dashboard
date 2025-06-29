import mongoose from "mongoose";
import app from "./app";
import transactionRoutes from "./routes/transaction.routes";
app.use("/api/transactions", transactionRoutes);


const PORT = process.env.PORT || 8080;

mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error(err));
