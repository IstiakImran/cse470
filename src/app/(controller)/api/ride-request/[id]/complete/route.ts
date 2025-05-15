// app/api/ride-request/[id]/complete/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import RideRequest from "@/models/RideRequest";
import Notification from "@/models/Notification";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/option";
import mongoose from "mongoose";

interface Params {
  params: {
    id: string;
  };
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const { id } = params;
    const userId = session.user.id;

    // Connect to database
    await dbConnect();

    // Find the ride request
    const rideRequest = await RideRequest.findById(id);

    if (!rideRequest) {
      return NextResponse.json(
        { error: "Ride request not found" },
        { status: 404 }
      );
    }

    // Only the ride owner can mark a ride as completed
    if (rideRequest.user.toString() !== userId) {
      return NextResponse.json(
        { error: "Only the ride owner can mark this ride as completed" },
        { status: 403 }
      );
    }

    // Verify that the ride is in 'accepted' status before marking as completed
    if (rideRequest.status !== "accepted") {
      return NextResponse.json(
        { error: "Only accepted rides can be marked as completed" },
        { status: 400 }
      );
    }

    // Update the ride status to completed
    rideRequest.status = "completed";
    await rideRequest.save();

    // Send notifications to all participants
    const notificationPromises = rideRequest.participants.map(
      (participantId: mongoose.Types.ObjectId) => {
        // Don't send notification to the ride owner
        if (participantId.toString() === userId) return Promise.resolve();

        return Notification.create({
          userId: participantId,
          senderId: userId,
          type: "ride_completed",
          message: `Your ride to ${rideRequest.destination} has been marked as completed`,
          isRead: false,
        });
      }
    );

    await Promise.all(notificationPromises);

    return NextResponse.json(
      { message: "Ride marked as completed", rideRequest },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error completing ride:", error);
    return NextResponse.json(
      { error: "Failed to mark ride as completed" },
      { status: 500 }
    );
  }
}
