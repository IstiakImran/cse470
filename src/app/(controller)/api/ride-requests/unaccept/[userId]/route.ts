// app/api/ride-requests/unaccept/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import RideRequest from "@/models/RideRequest";
import Notification from "@/models/Notification";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await dbConnect();
    const { requestId, userId } = await req.json();

    // Find the ride request
    const rideRequest = await RideRequest.findById(requestId).session(session);

    if (!rideRequest) {
      await session.abortTransaction();
      return NextResponse.json(
        { success: false, message: "Ride request not found" },
        { status: 404 }
      );
    }

    // Remove the user from the participants array
    rideRequest.participants = rideRequest.participants.filter(
      (participant: { toString: () => any }) =>
        participant.toString() !== userId
    );

    // Decrease the total accepted count
    rideRequest.totalAccepted = Math.max(0, rideRequest.totalAccepted - 1);

    // Save the updated ride request
    await rideRequest.save({ session });

    // Create a notification for the ride creator
    await Notification.create(
      [
        {
          user: rideRequest.user,
          message: "A passenger has unaccepted your ride.",
        },
      ],
      { session }
    );

    await session.commitTransaction();

    return NextResponse.json({
      success: true,
      message: "Unaccepted the ride successfully.",
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error unaccepting the ride:", error);
    return NextResponse.json(
      { success: false, error: "Failed to unaccept the ride." },
      { status: 500 }
    );
  } finally {
    session.endSession();
  }
}
