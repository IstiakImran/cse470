import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import connectDB from "@/lib/dbConnect";
import GroupComment from "@/models/GroupComments";
import { isValidObjectId } from "@/lib/utils";
import mongoose from "mongoose";

/* ─────────── GET all comments for a post ─────────── */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = params;

    if (!isValidObjectId(id))
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });

    const comments = await GroupComment.find({ postId: id })
      .populate("userId", "firstName lastName profilePicture")
      .sort({ parentId: 1, createdAt: -1 })
      .lean();

    const formatted = comments.map((c) => ({
      ...c,
      _id: c._id.toString(),
      postId: c.postId.toString(),
      userId: {
        ...c.userId,
        _id: c.userId._id.toString(),
      },
      parentId: c.parentId ? c.parentId.toString() : null,
      likes: (c.likes ?? []).map((x) => x.toString()),
    }));

    return NextResponse.json({ comments: formatted });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

/* ─────────── POST create comment / reply ─────────── */
export async function POST(req: NextRequest, consext: any) {
  try {
    const params = consext.params;
    const session = await getServerSession(authOptions);
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: postId } = params;
    if (!isValidObjectId(postId))
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });

    const { content, parentId } = await req.json();
    if (!content || !content.trim())
      return NextResponse.json({ error: "Content required" }, { status: 400 });

    await connectDB();

    // Create the comment data object
    const commentData = {
      postId: new mongoose.Types.ObjectId(postId),
      userId: new mongoose.Types.ObjectId(session.user.id),
      content,
    };
    console.log(parentId);
    // Add parentId if it exists and is valid
    if (parentId && isValidObjectId(parentId)) {
      const parentExists = await GroupComment.exists({ _id: parentId });
      if (!parentExists) {
        return NextResponse.json(
          { error: "Parent comment not found" },
          { status: 404 }
        );
      }
      commentData.parentId = new mongoose.Types.ObjectId(parentId);
      console.log("Parent ID set to:", commentData.parentId);
    }

    const newComment = await GroupComment.create(commentData);
    console.log("New comment created:", newComment);

    const populated = await GroupComment.findById(newComment._id)
      .populate("userId", "firstName lastName profilePicture")
      .lean();

    // Format the response
    const formattedComment = {
      ...populated,
      _id: populated._id.toString(),
      postId: populated.postId.toString(),
      userId: {
        ...populated.userId,
        _id: populated.userId._id.toString(),
      },
      parentId: populated.parentId ? populated.parentId.toString() : null,
      likes: (populated.likes ?? []).map((x) => x.toString()),
    };

    // Update comment count on the post
    const GroupPost = mongoose.models.GroupPost;
    await GroupPost.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });

    return NextResponse.json(
      {
        message: parentId ? "Reply posted" : "Comment posted",
        comment: formattedComment,
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("Error posting comment:", e);
    return NextResponse.json(
      { error: "Failed to post comment" },
      { status: 500 }
    );
  }
}
