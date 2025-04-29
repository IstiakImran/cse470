// app/api/ride-request/[id]/cancel/route.ts
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

    // Only the ride owner can cancel the ride
    if (rideRequest.user.toString() !== userId) {
      return NextResponse.json(
        { error: "Only the ride owner can cancel this ride" },
        { status: 403 }
      );
    }

    // Update the ride status to cancelled
    rideRequest.status = "cancelled";
    await rideRequest.save();

    // Send notifications to all participants
    const notificationPromises = rideRequest.participants.map(
      (participantId: mongoose.Types.ObjectId) => {
        // Don't send notification to the ride owner
        if (participantId.toString() === userId) return Promise.resolve();

        return Notification.create({
          userId: participantId,
          senderId: userId,
          type: "ride_cancelled",
          message: `Your ride to ${rideRequest.destination} has been cancelled`,
          isRead: false,
        });
      }
    );

    await Promise.all(notificationPromises);

    return NextResponse.json(
      { message: "Ride cancelled successfully", rideRequest },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error cancelling ride:", error);
    return NextResponse.json(
      { error: "Failed to cancel ride" },
      { status: 500 }
    );
  }
}
