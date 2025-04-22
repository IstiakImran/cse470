import mongoose, { Schema, Document } from "mongoose";

export interface IModerationLog extends Document {
  adminId: mongoose.Types.ObjectId;
  actionType: "DELETE_POST" | "BAN_USER" | "REMOVE_COMMENT" | "WARN_USER";
  targetType: "User" | "Post" | "Comment";
  targetId: mongoose.Types.ObjectId;
  reason: string;
  notes?: string;
}

const moderationLogSchema = new Schema<IModerationLog>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    actionType: {
      type: String,
      enum: ["DELETE_POST", "BAN_USER", "REMOVE_COMMENT", "WARN_USER"],
      required: true,
    },
    targetType: {
      type: String,
      enum: ["User", "Post", "Comment"],
      required: true,
    },
    targetId: { type: Schema.Types.ObjectId, required: true },
    reason: { type: String, required: true },
    notes: String,
  },
  { timestamps: true }
);

const ModerationLog =
  mongoose.models.ModerationLog ||
  mongoose.model<IModerationLog>("ModerationLog", moderationLogSchema);

export default ModerationLog;
