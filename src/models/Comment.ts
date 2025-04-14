import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
  userId: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  content: string;
}

const commentSchema = new Schema<IComment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    postId: { type: Schema.Types.ObjectId, ref: "Post" },
    content: String,
  },
  { timestamps: true }
);

const Comment =
  mongoose.models.Comment || mongoose.model<IComment>("Comment", commentSchema);

export default Comment;
