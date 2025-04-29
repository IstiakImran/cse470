// app/api/rides/accept/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import RideRequest from "@/models/RideRequest";
import User from "@/models/User";
import Conversation from "@/models/Conversation";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { requestId, userId } = await request.json();

    // Check if requestId or userId is undefined
    if (!requestId || !userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request. Missing requestId or userId.",
        },
        { status: 400 }
      );
    }

    // Start a transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Find the ride request
      const rideRequest = await RideRequest.findById(requestId).session(
        session
      );

      // Check if ride request exists
      if (!rideRequest) {
        await session.abortTransaction();
        return NextResponse.json(
          { success: false, message: "Ride request not found" },
          { status: 404 }
        );
      }

      // Check if the ride is already full
      if (rideRequest.totalAccepted >= rideRequest.totalPassengers) {
        await session.abortTransaction();
        return NextResponse.json(
          { success: false, message: "Ride is already full" },
          { status: 400 }
        );
      }

      // Check if user exists
      const user = await User.findById(userId).session(session);
      if (!user) {
        await session.abortTransaction();
        return NextResponse.json(
          { success: false, message: "User not found" },
          { status: 404 }
        );
      }

      // Check if user is already a participant
      if (
        rideRequest.participants.some(
          (p: { toString: () => any }) => p.toString() === userId
        )
      ) {
        await session.abortTransaction();
        return NextResponse.json(
          { success: false, message: "User already joined this ride" },
          { status: 400 }
        );
      }

      // Get the ride creator ID
      const rideCreatorId = rideRequest.user.toString();

      // Create or find a conversation between the ride creator and this user
      if (!rideRequest.conversation) {
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

      // Save the updated ride request
      await rideRequest.save({ session });

      // Commit the transaction
      await session.commitTransaction();

      return NextResponse.json(
        {
          success: true,
          message: "Ride accepted successfully",
          data: {
            rideRequest: {
              _id: rideRequest._id,
              status: rideRequest.status,
              totalAccepted: rideRequest.totalAccepted,
              totalPassengers: rideRequest.totalPassengers,
            },
          },
        },
        { status: 200 }
      );
    } catch (error) {
      // Abort the transaction on error
      await session.abortTransaction();
      throw error;
    } finally {
      // End the session
      session.endSession();
    }
  } catch (error) {
    console.error("Error accepting ride:", error);
    return NextResponse.json(
      { success: false, message: "Error accepting ride" },
      { status: 500 }
    );
  }
}
