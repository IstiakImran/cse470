import mongoose, { Schema, Document } from "mongoose";

export interface IBid extends Document {
  productId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  bidAmount: number;
  bidTime: Date;
}

const bidSchema = new Schema<IBid>({
  productId: { type: Schema.Types.ObjectId, ref: "Product" },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  bidAmount: Number,
  bidTime: { type: Date, default: Date.now },
});

const Bid = mongoose.models.Bid || mongoose.model<IBid>("Bid", bidSchema);

export default Bid;
