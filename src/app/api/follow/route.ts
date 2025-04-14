import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/option";
import connectDB from "@/lib/dbConnect";
import Follow from "@/models/Follow";
import Notification from "@/models/Notification";
import User from "@/models/User";
import mongoose from "mongoose";

export async function POST(request: Request) {
  try {
    // Get authenticated user session
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to the database
    await connectDB();

    // The user who is making the request
    const followerId = new mongoose.Types.ObjectId(session.user.id);

    // The user to follow/unfollow
    const { targetUserId } = await request.json();
    const followingId = new mongoose.Types.ObjectId(targetUserId);

    // Ensure you don't follow yourself
    if (followerId.equals(followingId)) {
      return NextResponse.json(
        { error: "You cannot follow yourself" },
        { status: 400 }
      );
    }

    // Check if target user exists
    const targetUser = await User.findById(followingId);
    if (!targetUser) {
      return NextResponse.json(
        { error: "Target user not found" },
        { status: 404 }
      );
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      followerId,
      followingId,
    });

    if (existingFollow) {
      // Already following - unfollow (delete record)
      await Follow.findByIdAndDelete(existingFollow._id);

      return NextResponse.json({
        message: "Unfollowed successfully",
        followed: false,
      });
    } else {
      // Not following - follow (create record)
      const newFollow = await Follow.create({
        followerId,
        followingId,
      });

      // Get follower's name for the notification
      const follower = await User.findById(followerId);
      const followerName = `${follower?.firstName} ${follower?.lastName}`;

      // Create notification for the user being followed
      await Notification.create({
        userId: followingId,
        senderId: followerId,
        type: "follow",
        message: `${followerName} started following you`,
        isRead: false,
      });

      return NextResponse.json({
        message: "Followed successfully",
        followed: true,
      });
    }
  } catch (error) {
    console.error("Follow toggle error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
