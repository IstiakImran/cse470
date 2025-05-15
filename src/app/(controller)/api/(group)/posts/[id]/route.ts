// api/posts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

import GroupPost from "@/models/GroupPost";
import Group from "@/models/Group";

import { isValidObjectId } from "@/lib/utils";
import connectDB from "@/lib/dbConnect";
import { authOptions } from "@/app/(controller)/api/auth/[...nextauth]/option";
import { getServerSession } from "next-auth";

// Get a post by ID
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

    await connectDB();

    const post = await GroupPost.findById(id)
      .populate("userId", "firstName lastName profilePicture")
      .populate("groupId", "name isPrivate");

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
              "Unauthorized: You need to be logged in to view posts in a private group",
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
          { error: "You must be a member of this group to view its posts" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

// Update a post
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
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

    // Check if user is the post creator
    if (post.userId.toString() !== userData.id) {
      return NextResponse.json(
        { error: "You can only edit your own posts" },
        { status: 403 }
      );
    }

    const { content, imageUrl } = await req.json();

    if (!content || content.trim() === "") {
      return NextResponse.json(
        { error: "Post content is required" },
        { status: 400 }
      );
    }

    const updatedPost = await GroupPost.findByIdAndUpdate(
      id,
      { $set: { content, imageUrl } },
      { new: true }
    ).populate("userId", "firstName lastName profilePicture");

    return NextResponse.json({
      message: "Post updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

// Delete a post
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
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

    // Get group to check permissions
    const group = await Group.findById(post.groupId);
    if (!group) {
      return NextResponse.json(
        { error: "Associated group not found" },
        { status: 404 }
      );
    }

    const isPostCreator = post.userId.toString() === userData.id;
    const isGroupAdmin = group.admins.some(
      (adminId: { toString: () => any }) => adminId.toString() === userData.id
    );
    const isGroupModerator = group.moderators.some(
      (modId: { toString: () => string }) => modId.toString() === userData.id
    );

    // Check if user has permission to delete
    if (!isPostCreator && !isGroupAdmin && !isGroupModerator) {
      return NextResponse.json(
        { error: "You do not have permission to delete this post" },
        { status: 403 }
      );
    }

    await GroupPost.findByIdAndDelete(id);

    return NextResponse.json({
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
