import mongoose, { Schema, Document } from "mongoose";

export interface IGroupPost extends Document {
  groupId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  content: string;
  imageUrl?: string;
  likes: mongoose.Types.ObjectId[]; // Add likes field to interface
}

const groupPostSchema = new Schema<IGroupPost>(
  {
    groupId: { type: Schema.Types.ObjectId, ref: "Group", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    imageUrl: String,
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }], // Add likes field to schema
  },
  { timestamps: true }
);

const GroupPost =
  mongoose.models.GroupPost ||
  mongoose.model<IGroupPost>("GroupPost", groupPostSchema);

export default GroupPost;
