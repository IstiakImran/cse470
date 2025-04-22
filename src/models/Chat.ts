// Chat.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IChat extends Document {
  members: mongoose.Types.ObjectId[];
  isGroupChat: boolean;
  groupName?: string;
}

const chatSchema = new Schema<IChat>(
  {
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isGroupChat: { type: Boolean, default: false },
    groupName: String,
  },
  { timestamps: true }
);

const Chat = mongoose.models.Chat || mongoose.model<IChat>("Chat", chatSchema);

export default Chat;
