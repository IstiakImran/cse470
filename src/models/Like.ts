import mongoose, { Schema, Document } from "mongoose";

export interface ILike extends Document {
  userId: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
}

const likeSchema = new Schema<ILike>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    postId: { type: Schema.Types.ObjectId, ref: "Post" },
  },
  { timestamps: true }
);

const Like = mongoose.models.Like || mongoose.model<ILike>("Like", likeSchema);

export default Like;
