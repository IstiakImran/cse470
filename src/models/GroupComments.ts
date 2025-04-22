import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
  postId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  content: string;
  parentId?: mongoose.Types.ObjectId;
  likes: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const groupCommentSchema = new Schema<IComment>(
  {
    postId: { type: Schema.Types.ObjectId, ref: "GroupPost", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    parentId: { type: Schema.Types.ObjectId, ref: "GroupComment" }, // Make sure the ref is correct
    likes: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  },
  { timestamps: true }
);

groupCommentSchema.index({ parentId: 1 });
groupCommentSchema.index({ postId: 1, createdAt: -1 });

// Use mongoose.models.GroupComment to prevent model recompilation error
const GroupComment =
  mongoose.models.GroupComment ||
  mongoose.model<IComment>("GroupComment", groupCommentSchema);
export default GroupComment;
