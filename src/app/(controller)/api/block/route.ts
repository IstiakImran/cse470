import { NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import User from "@/models/User";
import Follow from "@/models/Follow";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/option";

export async function POST(req: Request) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = session.user.id;
    const { targetUserId } = await req.json();

    if (!targetUserId) {
      return NextResponse.json(
        { error: "Target user ID is required" },
        { status: 400 }
      );
    }

    if (currentUserId === targetUserId) {
      return NextResponse.json(
        { error: "You cannot block yourself" },
        { status: 400 }
      );
    }

    await connectDB();

    // Get the current user
    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return NextResponse.json(
        { error: "Current user not found" },
        { status: 404 }
      );
    }

    // Check if target user exists
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return NextResponse.json(
        { error: "Target user not found" },
        { status: 404 }
      );
    }

    // Check if user is already blocked
    const targetUserObjectId = new mongoose.Types.ObjectId(targetUserId);
    const isBlocked = currentUser.blockedUsers.some(
      (id: { equals: (arg0: mongoose.Types.ObjectId) => any }) =>
        id.equals(targetUserObjectId)
    );

    if (isBlocked) {
      // Unblock the user
      await User.updateOne(
        { _id: currentUserId },
        { $pull: { blockedUsers: targetUserObjectId } }
      );
      return NextResponse.json({ isBlocked: false });
    } else {
      // Block the user

      // 1. Add to blocked users list
      await User.updateOne(
        { _id: currentUserId },
        { $push: { blockedUsers: targetUserObjectId } }
      );

      // 2. Remove any follow relationships in both directions
      // Current user unfollows target user
      await Follow.deleteOne({
        followerId: currentUserId,
        followingId: targetUserId,
      });

      // Target user unfollows current user
      await Follow.deleteOne({
        followerId: targetUserId,
        followingId: currentUserId,
      });

      return NextResponse.json({ isBlocked: true });
    }
  } catch (error) {
    console.error("Error in block user API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
