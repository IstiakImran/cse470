// app/api/ride-request/[id]/passenger/[passengerId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import RideRequest from "@/models/RideRequest";
import User from "@/models/User";
import Notification from "@/models/Notification";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/(controller)/api/auth/[...nextauth]/option";

interface Params {
  params: {
    id: string;
    passengerId: string;
  };
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const { id, passengerId } = params;
    const userId = session.user.id;

    // Connect to database
    await dbConnect();

    // Find the ride request
    const rideRequest = await RideRequest.findById(id).populate(
      "user",
      "firstName lastName"
    );

    if (!rideRequest) {
      return NextResponse.json(
        { error: "Ride request not found" },
        { status: 404 }
      );
    }

    // Only the ride owner can remove passengers
    if (rideRequest.user._id.toString() !== userId) {
      return NextResponse.json(
        { error: "Only the ride owner can remove passengers" },
        { status: 403 }
      );
    }

    // Check if passenger ID matches the ride creator
    if (rideRequest.user._id.toString() === passengerId) {
      return NextResponse.json(
        { error: "Ride creator cannot be removed as a passenger" },
        { status: 400 }
      );
    }

    // Check if passenger exists in the ride
    const passengerIndex = rideRequest.participants.findIndex(
      (p: { toString: () => string }) => p.toString() === passengerId
    );

    if (passengerIndex === -1) {
      return NextResponse.json(
        { error: "Passenger not found in this ride" },
        { status: 404 }
      );
    }

    // Remove passenger and update total accepted count
    rideRequest.participants.splice(passengerIndex, 1);
    rideRequest.totalAccepted -= 1;

    // If ride was accepted but now has free seats, change status back to pending
    if (
      rideRequest.status === "accepted" &&
      rideRequest.totalAccepted < rideRequest.totalPassengers
    ) {
      rideRequest.status = "pending";
    }

    await rideRequest.save();

    // Create notification for the removed passenger
    await Notification.create({
      userId: passengerId,
      senderId: userId,
      type: "ride_removal",
      message: `You have been removed from the ride to ${rideRequest.destination}`,
      isRead: false,
    });

    return NextResponse.json(
      { message: "Passenger removed successfully", rideRequest },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing passenger:", error);
    return NextResponse.json(
      { error: "Failed to remove passenger" },
      { status: 500 }
    );
  }
}
