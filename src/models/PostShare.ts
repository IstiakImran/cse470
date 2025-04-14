import mongoose, { Schema, Document } from "mongoose";

export interface IPostShare extends Document {
  userId: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  sharedAt: Date;
}

const postShareSchema = new Schema<IPostShare>({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  postId: { type: Schema.Types.ObjectId, ref: "Post" },
  sharedAt: { type: Date, default: Date.now },
});

const PostShare =
  mongoose.models.PostShare ||
  mongoose.model<IPostShare>("PostShare", postShareSchema);

export default PostShare;
