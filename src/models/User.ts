// models/User.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  bio?: string;
  profilePicture?: string;
  contactNumber?: string;
  themePreference: "light" | "dark";
  status: "Online" | "Away" | "Busy";
  phoneOtp?: string;
  phoneOtpExpiresAt?: Date;
  isPhoneVerified: boolean;
  emailOtp?: string;
  emailOtpExpiresAt?: Date;
  isEmailVerified: boolean;
  resetToken?: string;
  resetTokenExpiry?: Date;
  supabaseId?: string; // New field for Supabase user ID
}

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
    bio: String,
    profilePicture: String,
    contactNumber: { type: String, unique: true },
    themePreference: {
      type: String,
      enum: ["light", "dark"],
      default: "light",
    },
    status: {
      type: String,
      enum: ["Online", "Away", "Busy"],
      default: "Online",
    },
    phoneOtp: String,
    phoneOtpExpiresAt: Date,
    isPhoneVerified: { type: Boolean, default: false },
    emailOtp: String,
    emailOtpExpiresAt: Date,
    isEmailVerified: { type: Boolean, default: false },
    resetToken: String,
    resetTokenExpiry: Date,
    supabaseId: String, // New field for Supabase user ID
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
