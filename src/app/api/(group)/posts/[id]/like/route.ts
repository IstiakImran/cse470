// api/(group)/posts/[id]/like/route.ts
import { NextRequest, NextResponse } from "next/server";
import GroupPost from "@/models/GroupPost";
import Group from "@/models/Group";
import { isValidObjectId } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import connectDB from "@/lib/dbConnect";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Await params in Next.js route handler
    const { id } = await params;

    const session = await getServerSession(authOptions);
    const userData = session?.user;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    if (!userData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const post = await GroupPost.findById(id);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if post belongs to a private group
    const group = await Group.findById(post.groupId);
    if (group?.isPrivate) {
      const isMember = group.members.some(
        (memberId: { toString: () => string }) =>
          memberId.toString() === userData.id
      );

      if (!isMember) {
        return NextResponse.json(
          { error: "You must be a member of this group to like its posts" },
          { status: 403 }
        );
      }
    }

    // Initialize likes array if it doesn't exist
    if (!post.likes) {
      post.likes = [];
    }

    // Check if user already liked the post
    const alreadyLiked = post.likes.some(
      (userId: { toString: () => string }) => userId.toString() === userData.id
    );

    let message: string;
    let updatedPost;

    if (alreadyLiked) {
      // Unlike the post
      updatedPost = await GroupPost.findByIdAndUpdate(
        id,
        { $pull: { likes: userData.id } },
        { new: true }
      );
      message = "Post unliked successfully";
    } else {
      // Like the post
      updatedPost = await GroupPost.findByIdAndUpdate(
        id,
        { $addToSet: { likes: userData.id } },
        { new: true }
      );
      message = "Post liked successfully";
    }

    return NextResponse.json({
      message,
      likes: updatedPost.likes?.length || 0,
      isLiked: !alreadyLiked,
    });
  } catch (error) {
    console.error("Error liking/unliking post:", error);
    return NextResponse.json(
      { error: "Failed to like/unlike post" },
      { status: 500 }
    );
  }
}
