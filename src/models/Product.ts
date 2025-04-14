import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  sellerId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
}

const productSchema = new Schema<IProduct>(
  {
    sellerId: { type: Schema.Types.ObjectId, ref: "User" },
    name: String,
    description: String,
    price: Number,
    imageUrl: String,
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Product =
  mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema);

export default Product;
