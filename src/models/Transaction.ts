import mongoose, { Schema, Document } from "mongoose";

export interface ITransaction extends Document {
  buyerId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  amount: number;
  purchasedAt: Date;
}

const transactionSchema = new Schema<ITransaction>({
  buyerId: { type: Schema.Types.ObjectId, ref: "User" },
  productId: { type: Schema.Types.ObjectId, ref: "Product" },
  amount: Number,
  purchasedAt: { type: Date, default: Date.now },
});

const Transaction =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", transactionSchema);

export default Transaction;
