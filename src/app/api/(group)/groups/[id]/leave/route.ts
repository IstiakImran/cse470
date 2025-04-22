import { NextRequest, NextResponse } from "next/server";
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
        { error: "You are not a member of this group" },
        { status: 400 }
      );
    }

    // Prevent creator from leaving
    if (group.createdBy.toString() === userData.id) {
      return NextResponse.json(
        {
          error:
            "The group creator cannot leave the group. You must delete the group or transfer ownership.",
        },
        { status: 400 }
      );
    }

    // Remove user from members
    await Group.findByIdAndUpdate(id, {
      $pull: {
        members: userData.id,
        admins: userData.id,
        moderators: userData.id,
      },
    });

    return NextResponse.json({
      message: "You have left the group successfully",
    });
  } catch (error) {
    console.error("Error leaving group:", error);
    return NextResponse.json(
      { error: "Failed to leave group" },
      { status: 500 }
    );
  }
}
