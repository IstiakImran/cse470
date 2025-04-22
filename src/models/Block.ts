import mongoose, { Schema, Document } from "mongoose";

export interface IUserBlock extends Document {
  blockerId: mongoose.Types.ObjectId;
  blockedId: mongoose.Types.ObjectId;
  type: "block" | "mute";
}

const userBlockSchema = new Schema<IUserBlock>(
  {
    blockerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    blockedId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["block", "mute"], required: true },
  },
  { timestamps: true }
);

// Prevent duplicate mute/block
userBlockSchema.index({ blockerId: 1, blockedId: 1 }, { unique: true });

const UserBlock =
  mongoose.models.UserBlock ||
  mongoose.model<IUserBlock>("UserBlock", userBlockSchema);

export default UserBlock;
