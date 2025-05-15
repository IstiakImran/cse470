// api/groups/[id]/posts/route.ts
import { NextRequest, NextResponse } from "next/server";

import Group from "@/models/Group";
import GroupPost from "@/models/GroupPost";

import { isValidObjectId } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/(controller)/api/auth/[...nextauth]/option";
import connectDB from "@/lib/dbConnect";

// Get posts for a group
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userData = session?.user;
    const { id } = params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid group ID" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit") || 10);
    const page = Number(searchParams.get("page") || 1);

    await connectDB();

    const group = await Group.findById(id);
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // If group is private, check if user is a member
    if (group.isPrivate) {
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

    // Get posts with pagination
    const skip = (page - 1) * limit;

    const posts = await GroupPost.find({ groupId: id })
      .populate("userId", "firstName lastName profilePicture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPosts = await GroupPost.countDocuments({ groupId: id });

    return NextResponse.json({
      posts,
      pagination: {
        total: totalPosts,
        page,
        limit,
        pages: Math.ceil(totalPosts / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching group posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch group posts" },
      { status: 500 }
    );
  }
}

// Create a post in a group
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userData = session?.user;
    const { id } = params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid group ID" }, { status: 400 });
    }

    if (!userData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const group = await Group.findById(id);
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Check if user is a member
    const isMember = group.members.some(
      (memberId: { toString: () => string }) =>
        memberId.toString() === userData.id
    );

    if (!isMember) {
      return NextResponse.json(
        { error: "You must be a member of this group to create posts" },
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

    const newPost = await GroupPost.create({
      groupId: id,
      userId: userData.id,
      content,
      imageUrl,
    });

    // Populate user data for the response
    const post = await GroupPost.findById(newPost._id).populate(
      "userId",
      "firstName lastName profilePicture"
    );

    return NextResponse.json(
      { message: "Post created successfully", post },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
