import mongoose, { Schema, Document } from "mongoose";

export interface IPost extends Document {
  userId: mongoose.Types.ObjectId;
  content: string;
  imageUrl?: string;
  postType: "public" | "friends" | "only_me";
}

const postSchema = new Schema<IPost>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    imageUrl: String,
    postType: {
      type: String,
      enum: ["public", "friends", "only_me"],
      required: true,
    },
  },
  { timestamps: true }
);

const Post = mongoose.models.Post || mongoose.model<IPost>("Post", postSchema);

export default Post;
