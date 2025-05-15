import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import connectDB from "@/lib/dbConnect";
import Post from "@/models/Post";
import mongoose from "mongoose";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

export async function GET(req: Request, context: any) {
  try {
    const params = await context.params;
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ message: "Invalid post ID" }, { status: 400 });
    }

    // Fetch post with user details
    const post = await Post.findById(params.id)
      .populate("userId", "firstName lastName email")
      .lean();

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { message: "Error fetching post" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, context: any) {
  try {
    const params = await context.params;
    // Check authentication and admin status
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin (uncomment if you want to restrict to admins only)
    // if (!session.user.isAdmin) {
    //   return NextResponse.json(
    //     { message: "Only admins can delete posts" },
    //     { status: 403 }
    //   );
    // }

    // Connect to database
    await connectDB();

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ message: "Invalid post ID" }, { status: 400 });
    }

    // Delete post
    const deletedPost = await Post.findByIdAndDelete(params.id);

    if (!deletedPost) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { message: "Error deleting post" },
      { status: 500 }
    );
  }
}
