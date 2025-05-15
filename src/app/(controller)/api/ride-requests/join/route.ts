// app/api/ride-request/join/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import RideRequest from "@/models/RideRequest";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/option";

interface Params {
  params: {
    id: string;
  };
}

export async function POST(req: NextRequest, { params }: Params) {
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

    // Join the ride and create/update conversation
    const updatedRide = await RideRequest.joinRide(id, userId);

    return NextResponse.json(
      {
        message: "Successfully joined the ride",
        rideRequest: updatedRide,
        conversationId: updatedRide.conversation,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error joining ride:", error);
    return NextResponse.json(
      {
        error: (error as Error).message || "Failed to join ride request",
      },
      { status: 500 }
    );
  }
}
