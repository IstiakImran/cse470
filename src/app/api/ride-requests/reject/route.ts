// app/api/ride-requests/reject/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";

import Notification from "@/models/Notification";
import mongoose from "mongoose";
import RideRequest from "@/models/RideRequest";

export async function POST(request: NextRequest) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await dbConnect();
    const { requestId, userId } = await request.json();

    if (!requestId || !userId) {
      return NextResponse.json(
        { success: false, message: "Missing parameters" },
        { status: 400 }
      );
    }

    // Find the ride request
    const rideRequest = await RideRequest.findById(requestId).session(session);

    if (!rideRequest) {
      await session.abortTransaction();
      return NextResponse.json(
        { success: false, message: "Ride request not found" },
        { status: 404 }
      );
    }

    // Get the original participants for notifications
    const originalParticipants = [...rideRequest.participants];

    // Remove the user from the participants array
    rideRequest.participants = rideRequest.participants.filter(
      (participant: { toString: () => any }) =>
        participant.toString() !== userId
    );

    // Decrease the total accepted count
    rideRequest.totalAccepted = Math.max(0, rideRequest.totalAccepted - 1);

    // Save the updated ride request
    await rideRequest.save({ session });

    // Create notifications for all participants
    const notificationPromises = originalParticipants.map((participantId) =>
      Notification.create(
        [
          {
            user: participantId,
            message: "A participant has rejected the ride.",
          },
        ],
        { session }
      )
    );

    await Promise.all(notificationPromises);

    await session.commitTransaction();

    return NextResponse.json(
      {
        success: true,
        message: "Rejected the ride successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    await session.abortTransaction();
    console.error("Error rejecting ride:", error);
    return NextResponse.json(
      { success: false, message: "Error rejecting ride" },
      { status: 500 }
    );
  } finally {
    session.endSession();
  }
}
