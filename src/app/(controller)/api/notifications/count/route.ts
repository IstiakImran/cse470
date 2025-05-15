// app/api/notifications/count/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/option";
import connectDB from "@/lib/dbConnect";
import Notification from "@/models/Notification";
import User from "@/models/User";

export async function GET(request: NextRequest) {
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

    // Count unread notifications
    const count = await Notification.countDocuments({
      userId: user._id,
      isRead: false,
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching notification count:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
