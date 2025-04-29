// models/Complaint.ts
import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./User";
import { IRideRequest } from "./RideRequest";
// models/Complaint.ts
export interface IComplaint extends Document {
  user: mongoose.Types.ObjectId | IUser;
  rideRequest: mongoose.Types.ObjectId | IRideRequest;
  description: string;
  status: "pending" | "resolved" | "dismissed";
  createdAt: Date;
  updatedAt: Date;
}

const complaintSchema = new Schema<IComplaint>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rideRequest: {
      type: Schema.Types.ObjectId,
      ref: "RideRequest",
      required: true,
    },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "resolved", "dismissed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Complaint =
  mongoose.models.Complaint ||
  mongoose.model<IComplaint>("Complaint", complaintSchema);

export default Complaint;
