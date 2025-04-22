import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import GroupComment from "@/models/GroupComments";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { isValidObjectId } from "@/lib/utils";
import mongoose from "mongoose";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = params;
    if (!isValidObjectId(id))
      return NextResponse.json(
        { error: "Invalid comment ID" },
        { status: 400 }
      );

    await connectDB();

    const comment = await GroupComment.findById(id);
    if (!comment)
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });

    const userId = session.user.id;
    const hasLiked = (comment.likes ?? []).some(
      (x: mongoose.Types.ObjectId) => x.toString() === userId
    );

    const update = hasLiked
      ? { $pull: { likes: userId } }
      : { $addToSet: { likes: userId } };
    const updated = await GroupComment.findByIdAndUpdate(id, update, {
      new: true,
    }).lean();

    // convert likes to strings before sending
    updated!.likes = (updated!.likes ?? []).map((x: mongoose.Types.ObjectId) =>
      x.toString()
    );

    return NextResponse.json({
      message: hasLiked ? "Comment unliked" : "Comment liked",
      isLiked: !hasLiked,
      comment: updated,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 }
    );
  }
}
