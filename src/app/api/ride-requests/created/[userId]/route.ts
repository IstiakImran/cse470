// app/api/users/[userId]/created-rides/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import RideRequest from "@/models/RideRequest";

interface Params {
  userId: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    await dbConnect();
    const userId = params.userId;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Missing user ID" },
        { status: 400 }
      );
    }

    // Fetch rides where the current user is the creator
    const createdRides = await RideRequest.find({ user: userId })
      .sort({ rideTime: -1 })
      .populate("participants", "firstName lastName profilePicture")
      .lean();

    // Calculate total_accepted from participants array length for each ride
    const ridesWithAcceptedCount = createdRides.map((ride) => ({
      ...ride,
      total_accepted: ride.participants.length,
    }));

    return NextResponse.json(ridesWithAcceptedCount, { status: 200 });
  } catch (error) {
    console.error("Error fetching created rides:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching created rides" },
      { status: 500 }
    );
  }
}
