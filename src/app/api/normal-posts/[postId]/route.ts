// app/api/post/[postId]/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import connectDB from "@/lib/dbConnect";
import Comment from "@/models/Comment";
import User from "@/models/User";
import Post from "@/models/Post";
import Notification from "@/models/Notification";
import mongoose from "mongoose";

export async function DELETE(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();

    const postId = new mongoose.Types.ObjectId(params.postId);

    // Delete the post
    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }
    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    if (postId) {
      if (post.userId.toString() === session.user.id) {
        await Post.findByIdAndDelete(postId);
        await Comment.deleteMany({ postId });
        await Notification.deleteMany({ postId });
        await User.updateMany(
          { posts: { $in: [postId] } },
          { $pull: { posts: postId } }
        );
      }
    }

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("GET comments error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
