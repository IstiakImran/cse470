// app/api/admin/alumni-verification/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectDB from "@/lib/dbConnect";
import User from "@/models/User";
import { authOptions } from "../../auth/[...nextauth]/option";

// Get all alumni verification requests for admin
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // // Check if user is authenticated and is an admin
    // if (!session?.user || !(session.user as any).isAdmin) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    await connectDB();

    // Get all pending verification requests
    const pendingRequests = await User.find({
      alumniVerificationStatus: { $in: ["pending", "rejected"] },
    }).select(
      "_id firstName lastName email alumniIdNumber alumniCertificateLink alumniVerificationStatus alumniVerificationRequestDate alumniVerificationNotes"
    );

    return NextResponse.json({ requests: pendingRequests });
  } catch (error) {
    console.error("Error fetching alumni verification requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch verification requests" },
      { status: 500 }
    );
  }
}

// Update a verification request status
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    // if (!session?.user || !(session.user as any).isAdmin) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const { userId, status, notes } = await req.json();

    if (!userId || !status || !["verified", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid request parameters" },
        { status: 400 }
      );
    }

    await connectDB();

    // Update user with findByIdAndUpdate instead of findById + save
    const updateData = {
      alumniVerificationStatus: status,
      alumniVerificationNotes: notes || "",
      isAlumni: status === "verified", // Set isAlumni flag based on verification status
    };

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: `Alumni verification ${status}`,
      userId,
    });
  } catch (error) {
    console.error("Error updating alumni verification status:", error);
    return NextResponse.json(
      { error: "Failed to update verification status" },
      { status: 500 }
    );
  }
}
