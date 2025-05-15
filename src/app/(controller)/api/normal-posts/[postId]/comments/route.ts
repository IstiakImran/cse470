// app/api/post/[postId]/comments/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/(controller)/api/auth/[...nextauth]/option";
import connectDB from "@/lib/dbConnect";
import Comment from "@/models/Comment";
import User from "@/models/User";
import Post from "@/models/Post";
import Notification from "@/models/Notification";
import mongoose from "mongoose";

/* ---------------------------------
   GET: list comments
-----------------------------------*/
export async function GET(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    await connectDB();

    const postId = new mongoose.Types.ObjectId(params.postId);

    // Retrieve comments with user info using aggregation
    const comments = await Comment.aggregate([
      { $match: { postId } },
      { $sort: { createdAt: 1 } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          id: "$_id",
          userId: "$userId",
          userName: { $concat: ["$user.firstName", " ", "$user.lastName"] },
          content: "$content",
          createdAt: "$createdAt",
        },
      },
    ]);

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("GET comments error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* ---------------------------------
   POST: create a new comment
-----------------------------------*/
export async function POST(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const postId = new mongoose.Types.ObjectId(params.postId);
    const { content } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Create the new comment
    const newComment = await Comment.create({
      userId,
      postId,
      content,
    });

    // Get user info for the response
    const user = await User.findById(userId);
    const userName = `${user?.firstName} ${user?.lastName}`;

    // Get post details for notification
    const post = await Post.findById(postId);

    // Only create notification if post owner is not the same as commenter
    if (post && !post.userId.equals(userId)) {
      // Create notification for post owner
      await Notification.create({
        userId: post.userId,
        senderId: userId,
        type: "comment",
        message: `${userName} commented on your post`,
        isRead: false,
      });
    }

    // Construct the comment object for response
    const commentResponse = {
      id: newComment._id,
      userId: newComment.userId,
      userName,
      content: newComment.content,
      createdAt: newComment.createdAt,
    };

    return NextResponse.json({ comment: commentResponse });
  } catch (error) {
    console.error("POST comment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
