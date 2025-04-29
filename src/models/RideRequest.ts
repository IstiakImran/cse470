// models/RideRequest.ts
import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./User";
import Conversation from "./Conversation";

export interface IRideRequest extends Document {
  user: mongoose.Types.ObjectId | IUser;
  origin: string;
  destination: string;
  totalFare: number;
  vehicleType: "AutoRickshaw" | "CNG" | "Car" | "Hicks";
  totalPassengers: number;
  totalAccepted: number;
  rideTime: Date;
  note: string;
  status: "pending" | "accepted" | "completed" | "cancelled";
  participants: Array<mongoose.Types.ObjectId | IUser>;
  preferences: Array<{
    gender?: "Male" | "Female" | "Other";
    ageRange?: string;
    institution?: string;
  }>;
  conversation: mongoose.Types.ObjectId; // Reference to the conversation
  createdAt: Date;
  updatedAt: Date;
}

const rideRequestSchema = new Schema<IRideRequest>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    totalFare: { type: Number, required: true },
    vehicleType: {
      type: String,
      enum: ["AutoRickshaw", "CNG", "Car", "Hicks"],
      required: true,
    },
    totalPassengers: { type: Number, required: true },
    totalAccepted: { type: Number, default: 0 },
    rideTime: { type: Date, required: true },
    note: String,
    status: {
      type: String,
      enum: ["pending", "accepted", "completed", "cancelled"],
      default: "pending",
    },
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    preferences: [
      {
        gender: { type: String, enum: ["Male", "Female", "Other"] },
        ageRange: String,
        institution: String,
      },
    ],
    conversation: { type: Schema.Types.ObjectId, ref: "Conversation" },
  },
  { timestamps: true }
);

// Pre-save middleware to create a conversation if it doesn't exist
rideRequestSchema.pre("save", async function (next) {
  try {
    // Only create a conversation if this is a new document
    if (this.isNew) {
      // Leave conversation field empty initially
      // It will be populated when someone joins the ride
      next();
    } else {
      next();
    }
  } catch (error) {
    next(error as Error);
  }
});

// Static method to join a ride and start a conversation
rideRequestSchema.statics.joinRide = async function (
  rideId: string,
  userId: string
): Promise<IRideRequest> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the ride request
    const rideRequest = await this.findById(rideId).session(session);

    if (!rideRequest) {
      throw new Error("Ride request not found");
    }

    // Check if user is already a participant
    if (
      rideRequest.participants.some(
        (p: { toString: () => string }) => p.toString() === userId
      )
    ) {
      throw new Error("User already joined this ride");
    }

    // Get ride creator ID
    const rideCreatorId = rideRequest.user.toString();

    // Check if a conversation needs to be created
    if (!rideRequest.conversation) {
      // Create a conversation between ride creator and this user
      const conversation = await Conversation.findOrCreateConversation([
        rideCreatorId,
        userId,
      ]);

      // Update the ride request with the conversation ID
      rideRequest.conversation = conversation._id;
    }

    // Add user to participants
    rideRequest.participants.push(new mongoose.Types.ObjectId(userId));

    // Increment total accepted
    rideRequest.totalAccepted += 1;

    // Update ride status if all seats are filled
    if (rideRequest.totalAccepted >= rideRequest.totalPassengers) {
      rideRequest.status = "accepted";
    }

    await rideRequest.save({ session });
    await session.commitTransaction();

    return rideRequest;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Define model interface with static methods
interface RideRequestModel extends mongoose.Model<IRideRequest> {
  joinRide(rideId: string, userId: string): Promise<IRideRequest>;
}

const RideRequest =
  mongoose.models.RideRequest ||
  mongoose.model<IRideRequest, RideRequestModel>(
    "RideRequest",
    rideRequestSchema
  );

export default RideRequest;
