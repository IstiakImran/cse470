import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import connectDB from "@/lib/dbConnect";
import Notification from "@/models/Notification";
import mongoose from "mongoose";
import { authOptions } from "../../auth/[...nextauth]/option";

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    // Parse request body
    const body = await req.json();
    const { userId, senderId, type, message } = body;

    // Validate userId
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
    }

    // Create notification object
    const notificationData: any = {
      userId,
      type,
      message,
    };

    // Add senderId if provided and valid
    if (senderId && mongoose.Types.ObjectId.isValid(senderId)) {
      notificationData.senderId = senderId;
    }

    // Create and save notification
    const notification = new Notification(notificationData);
    await notification.save();

    return NextResponse.json({
      message: "Notification created successfully",
      notification,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { message: "Error creating notification" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    // Validate userId if provided
    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
    }

    // Build query
    const query: any = {};
    if (userId) {
      query.userId = userId;
    }

    // Fetch notifications
    const notifications = await Notification.find(query)
      .populate("userId", "firstName lastName email")
      .populate("senderId", "firstName lastName email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { message: "Error fetching notifications" },
      { status: 500 }
    );
  }
}
