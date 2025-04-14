import mongoose, { Schema, Document } from "mongoose";

export interface IFollow extends Document {
  followerId: mongoose.Types.ObjectId; // User who is following
  followingId: mongoose.Types.ObjectId; // User who is being followed
}

const followSchema = new Schema<IFollow>(
  {
    followerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    followingId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Create a compound index to ensure a user can only follow another user once
followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

const Follow =
  mongoose.models.Follow || mongoose.model<IFollow>("Follow", followSchema);

export default Follow;
