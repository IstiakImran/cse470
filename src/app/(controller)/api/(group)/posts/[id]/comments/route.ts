import { NextRequest, NextResponse } from "next/server";

import GroupPost from "@/models/GroupPost";
import Group from "@/models/Group";
import { isValidObjectId } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/(controller)/api/auth/[...nextauth]/option";
import connectDB from "@/lib/dbConnect";
import GroupComment from "@/models/GroupComments";

// Get comments for a post
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userData = session?.user;
    const { id } = params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const parentId = searchParams.get("parentId") || null;

    await connectDB();

    const post = await GroupPost.findById(id);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if post belongs to a private group
    const group = await Group.findById(post.groupId);
    if (group?.isPrivate) {
      if (!userData) {
        return NextResponse.json(
          {
            error:
              "Unauthorized: You need to be logged in to view comments in a private group",
          },
          { status: 401 }
        );
      }

      const isMember = group.members.some(
        (memberId: { toString: () => string }) =>
          memberId.toString() === userData.id
      );

      if (!isMember) {
        return NextResponse.json(
          { error: "You must be a member of this group to view comments" },
          { status: 403 }
        );
      }
    }

    // Build query based on whether we want top-level comments or replies
    const query: any = { postId: id };
    if (parentId === null) {
      // Get top-level comments (no parent)
      query.parentId = { $exists: false };
    } else if (isValidObjectId(parentId)) {
      // Get replies to a specific comment
      query.parentId = parentId;
    }

    const comments = await GroupComment.find(query)
      .populate("userId", "firstName lastName profilePicture")
      .sort({ createdAt: -1 });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// Add a comment to a post
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userData = session?.user;
    const { id } = params;

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

    // Check if user can comment (must be member of private groups)
    const group = await Group.findById(post.groupId);
    if (group?.isPrivate) {
      const isMember = group.members.some(
        (memberId: { toString: () => string }) =>
          memberId.toString() === userData.id
      );

      if (!isMember) {
        return NextResponse.json(
          {
            error: "You must be a member of this group to comment on its posts",
          },
          { status: 403 }
        );
      }
    }

    const { content, parentId } = await req.json();

    if (!content || content.trim() === "") {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    // If it's a reply, verify parent comment exists and belongs to this post
    if (parentId) {
      if (!isValidObjectId(parentId)) {
        return NextResponse.json(
          { error: "Invalid parent comment ID" },
          { status: 400 }
        );
      }

      const parentComment = await GroupComment.findById(parentId);
      if (!parentComment || parentComment.postId.toString() !== id) {
        return NextResponse.json(
          { error: "Parent comment not found or does not belong to this post" },
          { status: 404 }
        );
      }
    }

    // Create the comment
    const newComment = await GroupComment.create({
      postId: id,
      userId: userData.id,
      content,
      parentId,
    });

    // Update comment count in post
    await GroupPost.findByIdAndUpdate(id, { $inc: { commentCount: 1 } });

    // Populate user data for the response
    const comment = await GroupComment.findById(newComment._id).populate(
      "userId",
      "firstName lastName profilePicture"
    );

    return NextResponse.json(
      { message: "Comment added successfully", comment },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}
