import { NextRequest, NextResponse } from "next/server";

import Group from "@/models/Group";
import GroupRequest from "@/models/GroupRequest";

import { isValidObjectId } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/(controller)/api/auth/[...nextauth]/option";
import connectDB from "@/lib/dbConnect";

// Get all pending requests for a group
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

    if (!userData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const group = await Group.findById(id);
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Check if user is admin or moderator
    const isAdmin = group.admins.some(
      (adminId: { toString: () => string }) =>
        adminId.toString() === userData.id
    );

    const isModerator = group.moderators.some(
      (modId: { toString: () => string }) => modId.toString() === userData.id
    );

    if (!isAdmin && !isModerator) {
      return NextResponse.json(
        { error: "Only group admins and moderators can see join requests" },
        { status: 403 }
      );
    }

    // Get pending requests
    const requests = await GroupRequest.find({
      groupId: id,
      status: "pending",
    }).populate("userId", "firstName lastName email profilePicture");

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Error fetching join requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch join requests" },
      { status: 500 }
    );
  }
}

// Handle join request (accept/reject)
export async function PUT(
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

    // Check if user is admin or moderator
    const isAdmin = group.admins.some(
      (adminId: { toString: () => string }) =>
        adminId.toString() === userData.id
    );

    const isModerator = group.moderators.some(
      (modId: { toString: () => string }) => modId.toString() === userData.id
    );

    if (!isAdmin && !isModerator) {
      return NextResponse.json(
        { error: "Only group admins and moderators can handle join requests" },
        { status: 403 }
      );
    }

    const { requestId, action } = await req.json();

    if (!requestId || !action || (action !== "accept" && action !== "reject")) {
      return NextResponse.json(
        { error: "Invalid request parameters" },
        { status: 400 }
      );
    }

    // Find request
    const request = await GroupRequest.findById(requestId);
    if (!request || request.groupId.toString() !== id) {
      return NextResponse.json(
        { error: "Join request not found" },
        { status: 404 }
      );
    }

    if (request.status !== "pending") {
      return NextResponse.json(
        { error: "This request has already been processed" },
        { status: 400 }
      );
    }

    if (action === "accept") {
      // Add user to group members
      await Group.findByIdAndUpdate(id, {
        $addToSet: { members: request.userId },
      });

      // Update request status
      request.status = "accepted";
      await request.save();

      return NextResponse.json({
        message: "Join request accepted successfully",
      });
    } else {
      // Update request status
      request.status = "rejected";
      await request.save();

      return NextResponse.json({
        message: "Join request rejected successfully",
      });
    }
  } catch (error) {
    console.error("Error handling join request:", error);
    return NextResponse.json(
      { error: "Failed to handle join request" },
      { status: 500 }
    );
  }
}
