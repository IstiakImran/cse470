// app/api/ride-request/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import RideRequest from "@/models/RideRequest";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/option";

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    // Connect to database
    await dbConnect();

    // Parse request body
    const body = await req.json();

    // Get the current user ID from the session
    const userId = session.user.id;

    // Create new ride request with the user ID
    const rideRequest = await RideRequest.create({
      user: userId,
      origin: body.origin,
      destination: body.destination,
      totalFare: body.totalFare,
      vehicleType: body.vehicleType,
      totalPassengers: body.totalPassengers,
      rideTime: new Date(body.rideTime),
      note: body.note || "",
      preferences: body.preferences || [],
    });

    return NextResponse.json(
      { message: "Ride request created successfully", rideRequest },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating ride request:", error);
    return NextResponse.json(
      { error: "Failed to create ride request" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    // Connect to database
    await dbConnect();

    // Parse query parameters
    const url = new URL(req.url);
    const status = url.searchParams.get("status") || "all";
    const search = url.searchParams.get("search") || "";
    const dateRange = url.searchParams.get("dateRange") || "";
    const location = url.searchParams.get("location") || "";
    const vehicleType = url.searchParams.get("vehicleType") || "all";

    // Get the current user ID from the session
    const userId = session.user.id;

    // Build query based on filters
    const query: any = {
      $or: [
        { user: userId }, // User's own requests
        { status: "pending" }, // Pending requests they might join
        { participants: userId }, // Rides where the user is a participant
      ],
    };

    // Add status filter if specific status requested
    if (status !== "all") {
      query.status = status;
    }

    // Add date filter if specified
    if (dateRange) {
      const startOfDay = new Date(dateRange);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(dateRange);
      endOfDay.setHours(23, 59, 59, 999);

      query.rideTime = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    // Add location filter if specified
    if (location) {
      query.$or = [
        { origin: { $regex: location, $options: "i" } },
        { destination: { $regex: location, $options: "i" } },
      ];
    }

    // Add vehicle type filter if specified
    if (vehicleType !== "all") {
      query.vehicleType = vehicleType;
    }

    // Add search functionality
    if (search) {
      // If we already have an $or operator, we need to handle it differently
      const searchConditions = [
        { origin: { $regex: search, $options: "i" } },
        { destination: { $regex: search, $options: "i" } },
        { note: { $regex: search, $options: "i" } },
        { vehicleType: { $regex: search, $options: "i" } },
      ];

      // If there's already an $or, we need to use $and to combine them
      if (query.$or) {
        const existingOr = query.$or;
        delete query.$or;
        query.$and = [{ $or: existingOr }, { $or: searchConditions }];
      } else {
        query.$or = searchConditions;
      }
    }

    // Fetch ride requests based on filters
    const rideRequests = await RideRequest.find(query)
      .populate("user", "firstName lastName profilePicture")
      .populate("participants", "firstName lastName profilePicture")
      .populate("conversation")
      .sort({ createdAt: -1 });

    return NextResponse.json({ rideRequests }, { status: 200 });
  } catch (error) {
    console.error("Error fetching ride requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch ride requests" },
      { status: 500 }
    );
  }
}
