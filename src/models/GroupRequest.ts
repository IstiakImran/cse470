import mongoose, { Schema, Document } from "mongoose";

export interface IGroupRequest extends Document {
  groupId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  status: "pending" | "accepted" | "rejected";
  type: "request" | "invite";
}

const groupRequestSchema = new Schema<IGroupRequest>(
  {
    groupId: { type: Schema.Types.ObjectId, ref: "Group", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    type: {
      type: String,
      enum: ["request", "invite"], // request = user applied; invite = admin invited
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure uniqueness of groupId and userId combination
groupRequestSchema.index({ groupId: 1, userId: 1 }, { unique: true });

const GroupRequest =
  mongoose.models.GroupRequest ||
  mongoose.model<IGroupRequest>("GroupRequest", groupRequestSchema);

export default GroupRequest;
