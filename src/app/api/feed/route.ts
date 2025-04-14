import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/option";
import connectDB from "@/lib/dbConnect";
import Post from "@/models/Post";
// import User from "@/models/User";
import Follow from "@/models/Follow";
// import Like from "@/models/Like";
import mongoose from "mongoose";

export async function GET() {
  try {
    // 1) Ensure user is authenticated
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2) Connect to DB
    await connectDB();

    const currentUserId = new mongoose.Types.ObjectId(session.user.id);

    // 3) Get IDs of the people the current user follows
    const followingData = await Follow.find({ followerId: currentUserId });
    const followingIds = followingData.map((follow) => follow.followingId);

    // 4) Build an array of userIds whose posts we might show:
    //    - the current user
    //    - all people the user follows
    const userIdsToShow = [currentUserId, ...followingIds];

    // 5) Find posts based on visibility rules
    const posts = await Post.aggregate([
      {
        $match: {
          $and: [
            // Post belongs to current user or someone they follow
            { userId: { $in: userIdsToShow } },
            // Apply visibility rules:
            {
              $or: [
                // Public posts are visible to everyone
                { postType: "public" },
                // Friends posts only visible if user follows the creator
                {
                  $and: [
                    { postType: "friends" },
                    { userId: { $in: followingIds } },
                  ],
                },
                // Only_me posts only visible to creator
                {
                  $and: [{ postType: "only_me" }, { userId: currentUserId }],
                },
              ],
            },
          ],
        },
      },
      // Join with User collection to get user details
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      // Count likes for each post
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "postId",
          as: "likes",
        },
      },
      // Check if current user has liked the post
      {
        $addFields: {
          likesCount: { $size: "$likes" },
          hasLiked: {
            $in: [currentUserId, "$likes.userId"],
          },
        },
      },
      // Sort by creation date (newest first)
      { $sort: { createdAt: -1 } },
      // Shape the final output
      {
        $project: {
          id: "$_id",
          content: 1,
          imageUrl: 1,
          postType: 1,
          createdAt: 1,
          updatedAt: 1,
          likesCount: 1,
          hasLiked: 1,
          user: {
            id: "$userDetails._id",
            firstName: "$userDetails.firstName",
            lastName: "$userDetails.lastName",
            profilePicture: { $ifNull: ["$userDetails.profilePicture", null] },
          },
        },
      },
    ]);

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Error fetching feed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
