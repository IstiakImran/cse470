// app/api/user/alumni-verification/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import connectDB from "@/lib/dbConnect";
import User from "@/models/User";
import { authOptions } from "../../auth/[...nextauth]/option";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { alumniIdNumber, alumniCertificateLink } = await req.json();

    if (!alumniIdNumber || !alumniCertificateLink) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the user by ID - do not create a new document
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      {
        $set: {
          alumniIdNumber: alumniIdNumber,
          alumniCertificateLink: alumniCertificateLink,
          alumniVerificationStatus: "pending",
          alumniVerificationRequestDate: new Date(),
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Alumni verification request submitted successfully",
      status: "pending",
    });
  } catch (error) {
    console.error("Error processing alumni verification request:", error);
    return NextResponse.json(
      { error: "Failed to process verification request" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get user's current alumni verification status
    const user = await User.findById(session.user.id).select(
      "alumniVerificationStatus alumniIdNumber alumniVerificationRequestDate"
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      status: user.alumniVerificationStatus,
      idNumber: user.alumniIdNumber,
      requestDate: user.alumniVerificationRequestDate,
    });
  } catch (error) {
    console.error("Error fetching alumni verification status:", error);
    return NextResponse.json(
      { error: "Failed to fetch verification status" },
      { status: 500 }
    );
  }
}
