// app/api/notifications/mark-read/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import Notification from "@/models/Notification";
import User from "@/models/User";
import { authOptions } from "../../auth/[...nextauth]/option";
import connectDB from "@/lib/dbConnect";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get user ID from email
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Mark all unread notifications as read
    const result = await Notification.updateMany(
      { userId: user._id, isRead: false },
      { $set: { isRead: true } }
    );

    return NextResponse.json({
      success: true,
      updatedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
