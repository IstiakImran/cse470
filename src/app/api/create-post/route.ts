// app/api/create-post/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/option";
import connectDB from "@/lib/dbConnect";
import Post from "@/models/Post";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    // Check if the user is authenticated
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    const { content, imageUrl, postType } = await req.json();
    const userId = new mongoose.Types.ObjectId(session.user.id);

    if (!content || !postType) {
      return NextResponse.json(
        { error: "Content and post type are required" },
        { status: 400 }
      );
    }

    // Create new post
    const newPost = await Post.create({
      userId,
      content,
      imageUrl: imageUrl || null,
      postType,
    });

    return NextResponse.json({
      message: "Post created successfully",
      postId: newPost._id,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
