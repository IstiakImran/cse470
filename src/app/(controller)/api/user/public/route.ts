import { NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import User from "@/models/User";
import Post from "@/models/Post";
import Follow from "@/models/Follow";
import mongoose from "mongoose";
import { authOptions } from "../../auth/[...nextauth]/option";
import { getServerSession } from "next-auth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("id");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    await connectDB();

    // Find the user
    const user = await User.findById(userId).lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find user's posts
    const posts = await Post.find({
      userId: new mongoose.Types.ObjectId(userId),
      // Only include public posts for public profile
      postType: "public",
    })
      .lean()
      .sort({ createdAt: -1 });

    // Count followers and following
    const followersCount = await Follow.countDocuments({
      followingId: new mongoose.Types.ObjectId(userId),
    });

    const followingCount = await Follow.countDocuments({
      followerId: new mongoose.Types.ObjectId(userId),
    });

    // Format the posts
    const formattedPosts = posts.map((post) => ({
      id: (post as any)._id.toString(),
      content: post.content,
      imageUrl: post.imageUrl,
      postType: post.postType,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    }));

    // Get session information for the current user
    const session = await getServerSession(authOptions);
    let isFollowing = false;
    let isBlocked = false;

    if (session && session.user.id !== userId) {
      const viewerId = session.user.id;

      // Check if the viewer is following this profile
      const followCheck = await Follow.findOne({
        followerId: new mongoose.Types.ObjectId(viewerId),
        followingId: new mongoose.Types.ObjectId(userId),
      });

      isFollowing = !!followCheck;

      // Check if the viewer has blocked this profile
      const currentUser = await User.findById(viewerId);
      if (currentUser) {
        isBlocked = currentUser.blockedUsers.some(
          (id: mongoose.Types.ObjectId) => id.toString() === userId
        );
      }
    }

    // Format the response
    const userProfile = {
      id: (user as any)._id.toString(),
      firstName: (user as any).firstName,
      lastName: (user as any).lastName,
      email: (user as any).email,
      profilePicture: (user as any).profilePicture || null,
      bio: (user as any).bio || "No bio available",
      createdAt: (user as any).createdAt
        ? new Date((user as any).createdAt).toISOString()
        : null,
      updatedAt: (user as any).updatedAt
        ? new Date((user as any).updatedAt).toISOString()
        : null,
      posts: formattedPosts,
      followersCount,
      followingCount,
      isFollowing,
      isBlocked,
      isAlumni: (user as any).isAlumni || false,
      alumniVerificationStatus:
        (user as any).alumniVerificationStatus || "unverified",
    };

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error("Error fetching public user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
