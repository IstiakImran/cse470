// app/api/ride-requests/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import RideRequest from "@/models/RideRequest";

interface RideRequestData {
  userId: string;
  origin: string;
  destination: string;
  totalFare: number;
  vehicleType: string;
  rideTime: string;
  totalPassengers: number;
  status: string;
  preferences: {
    gender?: string;
    ageRange?: string;
    institution?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const data = (await request.json()) as RideRequestData;
    const {
      userId,
      origin,
      destination,
      totalFare,
      vehicleType,
      rideTime,
      totalPassengers,
      status,
      preferences,
    } = data;

    // Create the ride request
    const newRideRequest = await RideRequest.create({
      user: userId,
      origin,
      destination,
      totalFare,
      vehicleType,
      rideTime: new Date(rideTime),
      totalPassengers,
      totalAccepted: 0,
      status,
      participants: [userId], // Add the creator as first participant
      preferences: preferences ? [preferences] : [],
    });

    return NextResponse.json(
      {
        success: true,
        requestId: newRideRequest._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating ride request:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const sortByParams = searchParams.get("sortBy") || "";
    const minFare = parseFloat(searchParams.get("minFare") || "0");
    const maxFare = parseFloat(searchParams.get("maxFare") || "100000");
    const vehicleType = searchParams.get("vehicleType") || "";
    const totalPassengers = parseInt(
      searchParams.get("totalPassengers") || "0"
    );
    const genderPreference = searchParams.get("genderPreference") || "";
    const ageRange = searchParams.get("ageRange") || "";
    const institution = searchParams.get("institution") || "";
    const origin = searchParams.get("origin") || "";
    const destination = searchParams.get("destination") || "";
    const rideTimeFrom = searchParams.get("rideTimeFrom") || "";
    const rideTimeTo = searchParams.get("rideTimeTo") || "";

    console.log(
      "Search params:",
      sortByParams,
      minFare,
      maxFare,
      vehicleType,
      totalPassengers,
      genderPreference,
      ageRange,
      institution,
      origin,
      destination,
      rideTimeFrom,
      rideTimeTo
    );

    // Build the query filter
    const query: any = {
      status: { $ne: "cancelled" }, // Don't show cancelled rides
    };

    // Default time range: today to next 3 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(today.getDate() + 3);
    threeDaysLater.setHours(23, 59, 59, 999);

    // Set default date range if no dates are provided
    if (!rideTimeFrom && !rideTimeTo) {
      query.rideTime = {
        $gte: today,
        $lte: threeDaysLater,
      };
    } else {
      // Use provided date range
      if (rideTimeFrom && rideTimeTo) {
        query.rideTime = {
          $gte: new Date(rideTimeFrom),
          $lte: new Date(rideTimeTo),
        };
      } else if (rideTimeFrom) {
        query.rideTime = { $gte: new Date(rideTimeFrom) };
      } else if (rideTimeTo) {
        query.rideTime = { $lte: new Date(rideTimeTo) };
      }
    }

    // Only add fare filters if they're not the default values
    if (minFare > 0) {
      query.totalFare = query.totalFare || {};
      query.totalFare.$gte = minFare;
    }

    if (maxFare < 100000) {
      query.totalFare = query.totalFare || {};
      query.totalFare.$lte = maxFare;
    }

    // Only add passengers filter if it's greater than 0
    if (totalPassengers > 0) {
      query.totalPassengers = { $gte: totalPassengers };
    }

    if (vehicleType) {
      query.vehicleType = vehicleType;
    }

    if (origin) {
      query.origin = new RegExp(origin, "i");
    }

    if (destination) {
      query.destination = new RegExp(destination, "i");
    }

    // Handle preferences filters
    if (genderPreference) {
      query["preferences.gender"] = genderPreference;
    }

    if (ageRange) {
      query["preferences.ageRange"] = ageRange;
    }

    if (institution) {
      query["preferences.institution"] = new RegExp(institution, "i");
    }

    // Parse the sort options
    const sortOptions: Record<string, 1 | -1> = {};

    if (sortByParams) {
      const sortByArray = sortByParams.split(",");

      sortByArray.forEach((sortOption) => {
        switch (sortOption) {
          case "gender":
            sortOptions["preferences.gender"] = 1;
            break;
          case "age":
            sortOptions["preferences.ageRange"] = 1;
            break;
          case "fare":
            sortOptions["totalFare"] = 1;
            break;
          case "origin":
            sortOptions["origin"] = 1;
            break;
          case "destination":
            sortOptions["destination"] = 1;
            break;
          case "rideTime":
            sortOptions["rideTime"] = 1;
            break;
        }
      });
    }

    // Default sort by ride time (soonest first) if no sort options provided
    if (Object.keys(sortOptions).length === 0) {
      sortOptions.rideTime = 1;
    }

    // Execute the query
    const rideRequests = await RideRequest.find(query)
      .sort(sortOptions)
      .populate("user", "firstName lastName profilePicture")
      .lean();

    console.log(rideRequests);

    return NextResponse.json(rideRequests, { status: 200 });
  } catch (error) {
    console.error("Error fetching ride requests:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
