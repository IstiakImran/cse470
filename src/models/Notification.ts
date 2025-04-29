import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  type: string;
  message: string;
  isRead: boolean;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: false },
    type: String,
    message: String,
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", notificationSchema);

export default Notification;
