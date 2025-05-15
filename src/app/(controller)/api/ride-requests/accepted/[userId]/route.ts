// app/api/users/[userId]/joined-rides/route.ts
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

    // Fetch rides where the current user is a participant but not the creator
    const joinedRides = await RideRequest.find({
      participants: userId,
      user: { $ne: userId }, // Exclude rides where user is the creator
    })
      .sort({ rideTime: -1 })
      .populate("user", "firstName lastName profilePicture")
      .lean();

    return NextResponse.json(joinedRides, { status: 200 });
  } catch (error) {
    console.error("Error fetching joined rides:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching joined rides" },
      { status: 500 }
    );
  }
}
