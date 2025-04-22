import mongoose, { Schema, Document } from "mongoose";

export interface IGroup extends Document {
  name: string;
  description?: string;
  isPrivate: boolean;
  createdBy: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  admins: mongoose.Types.ObjectId[];
  moderators: mongoose.Types.ObjectId[];
  coverImage?: string;
}

const groupSchema = new Schema<IGroup>(
  {
    name: { type: String, required: true, unique: true },
    description: String,
    isPrivate: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    admins: [{ type: Schema.Types.ObjectId, ref: "User" }],
    moderators: [{ type: Schema.Types.ObjectId, ref: "User" }],
    coverImage: String,
  },
  { timestamps: true }
);

// Add the creator as an admin and member automatically
groupSchema.pre("save", function (next) {
  if (this.isNew) {
    if (!this.admins.includes(this.createdBy)) {
      this.admins.push(this.createdBy);
    }
    if (!this.members.includes(this.createdBy)) {
      this.members.push(this.createdBy);
    }
  }
  next();
});

const Group =
  mongoose.models.Group || mongoose.model<IGroup>("Group", groupSchema);

export default Group;
