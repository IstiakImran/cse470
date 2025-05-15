import { NextRequest, NextResponse } from "next/server";
import Group from "@/models/Group";
import GroupRequest from "@/models/GroupRequest";
import { isValidObjectId } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/(controller)/api/auth/[...nextauth]/option";
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

    // Check if user is already a member
    const isMember = group.members.some(
      (memberId: { toString: () => string }) =>
        memberId.toString() === userData.id
    );

    if (isMember) {
      return NextResponse.json(
        { error: "You are already a member of this group" },
        { status: 400 }
      );
    }

    // Handle based on group privacy settings
    if (group.isPrivate) {
      // Check if there's already a pending request
      const existingRequest = await GroupRequest.findOne({
        groupId: id,
        userId: userData.id,
        status: "pending",
      });

      if (existingRequest) {
        return NextResponse.json(
          { error: "You already have a pending request to join this group" },
          { status: 400 }
        );
      }

      // Create a join request for private groups
      await GroupRequest.create({
        groupId: id,
        userId: userData.id,
        type: "request",
      });

      return NextResponse.json({
        message: "Join request sent successfully. Waiting for approval.",
      });
    } else {
      // For public groups, add user directly
      await Group.findByIdAndUpdate(id, {
        $addToSet: { members: userData.id },
      });

      return NextResponse.json({
        message: "You have joined the group successfully",
      });
    }
  } catch (error) {
    console.error("Error joining group:", error);
    return NextResponse.json(
      { error: "Failed to join group" },
      { status: 500 }
    );
  }
}
