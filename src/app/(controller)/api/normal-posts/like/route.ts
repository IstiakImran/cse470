// app/api/post/like/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/option";
import connectDB from "@/lib/dbConnect";
import Like from "@/models/Like";
import Notification from "@/models/Notification";
import User from "@/models/User";
import Post from "@/models/Post";
import mongoose from "mongoose";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // The user who is making the request
    const userId = new mongoose.Types.ObjectId(session.user.id);
    const { postId } = await request.json();
    const postObjectId = new mongoose.Types.ObjectId(postId);

    // Check if a like record already exists
    const existingLike = await Like.findOne({
      userId,
      postId: postObjectId,
    });

    if (existingLike) {
      // Already liked — remove like
      await Like.findByIdAndDelete(existingLike._id);

      return NextResponse.json({
        message: "Unliked successfully",
        liked: false,
      });
    } else {
      // Not liked yet — add like
      await Like.create({
        userId,
        postId: postObjectId,
      });

      // Get post details to create notification
      const post = await Post.findById(postObjectId);

      // Only create notification if post owner is not the same as liker
      if (post && !post.userId.equals(userId)) {
        const liker = await User.findById(userId);
        const likerName = `${liker?.firstName} ${liker?.lastName}`;

        // Create notification for post owner
        await Notification.create({
          userId: post.userId,
          senderId: userId,
          type: "like",
          message: `${likerName} liked your post`,
          isRead: false,
        });
      }

      return NextResponse.json({
        message: "Liked successfully",
        liked: true,
      });
    }
  } catch (error) {
    console.error("Like toggle error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
