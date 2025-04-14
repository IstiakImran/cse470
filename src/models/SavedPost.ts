import mongoose, { Schema, Document } from "mongoose";

export interface ISavedPost extends Document {
  userId: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  savedAt: Date;
}

const savedPostSchema = new Schema<ISavedPost>({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  postId: { type: Schema.Types.ObjectId, ref: "Post" },
  savedAt: { type: Date, default: Date.now },
});

const SavedPost =
  mongoose.models.SavedPost ||
  mongoose.model<ISavedPost>("SavedPost", savedPostSchema);

export default SavedPost;
