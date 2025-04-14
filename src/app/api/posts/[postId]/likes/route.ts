// app/api/post/[postId]/likes/route.ts

import { NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import Like from "@/models/Like";
import mongoose from "mongoose";

export async function GET(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    await connectDB();

    const postId = new mongoose.Types.ObjectId(params.postId);

    // Get all users who liked this post using aggregation
    const likes = await Like.aggregate([
      { $match: { postId } },
      {
        $lookup: {
          from: "users", // Collection name (lowercase and plural)
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          userId: "$userId",
          userName: { $concat: ["$user.firstName", " ", "$user.lastName"] },
        },
      },
    ]);

    return NextResponse.json({ likes });
  } catch (error) {
    console.error("Get likes error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
