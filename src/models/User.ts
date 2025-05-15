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
  supabaseId?: string;
  blockedUsers: mongoose.Types.ObjectId[]; // Users that this user has blocked
  isAdmin: boolean; // Added admin flag
  isAlumni: boolean; // Alumni verification status
  alumniVerificationStatus: "unverified" | "pending" | "verified" | "rejected";
  alumniIdNumber?: string; // Student/Alumni ID number
  alumniCertificateLink?: string; // Link to graduation certificate
  alumniVerificationRequestDate?: Date; // When the verification was requested
  alumniVerificationNotes?: string; // Admin notes about verification
}

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
    bio: String,
    profilePicture: String,
    contactNumber: { type: String, unique: true, sparse: true },
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
    supabaseId: String,
    blockedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isAdmin: { type: Boolean, default: false }, // Added with default value false
    isAlumni: { type: Boolean, default: false },
    alumniVerificationStatus: {
      type: String,
      enum: ["unverified", "pending", "verified", "rejected"],
      default: "unverified",
    },
    alumniIdNumber: String,
    alumniCertificateLink: String,
    alumniVerificationRequestDate: Date,
    alumniVerificationNotes: String,
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
