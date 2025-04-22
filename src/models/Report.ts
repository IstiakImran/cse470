import mongoose, { Schema, Document } from "mongoose";

export interface IReport extends Document {
  reporterId: mongoose.Types.ObjectId;
  targetType: "User" | "Post" | "Comment";
  targetId: mongoose.Types.ObjectId;
  reason: string;
  resolved: boolean;
}

const reportSchema = new Schema<IReport>(
  {
    reporterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetType: {
      type: String,
      enum: ["User", "Post", "Comment"],
      required: true,
    },
    targetId: { type: Schema.Types.ObjectId, required: true },
    reason: { type: String, required: true },
    resolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Report =
  mongoose.models.Report || mongoose.model<IReport>("Report", reportSchema);

export default Report;
