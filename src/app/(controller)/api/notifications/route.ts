// app/api/notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import Notification from "@/models/Notification";
import User from "@/models/User";
import mongoose from "mongoose";
import { authOptions } from "../auth/[...nextauth]/option";
import connectDB from "@/lib/dbConnect";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get pagination parameters from query
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    await connectDB();

    // Get user ID from email
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch notifications with pagination and populate sender details
    const notifications = await Notification.find({ userId: user._id })
      .sort({ createdAt: -1 }) // Latest first
      .skip(skip)
      .limit(limit)
      .populate("senderId", "firstName lastName profilePicture")
      .lean();

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// This endpoint allows creating a notification (for testing or internal use)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { userId, type, message, senderId } = data;

    if (!userId || !type || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    // Create new notification
    const notification = await Notification.create({
      userId: new mongoose.Types.ObjectId(userId),
      senderId: senderId ? new mongoose.Types.ObjectId(senderId) : null,
      type,
      message,
      isRead: false,
    });

    return NextResponse.json({ notification }, { status: 201 });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
