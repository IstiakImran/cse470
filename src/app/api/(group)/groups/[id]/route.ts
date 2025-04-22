// api/groups/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

import Group from "@/models/Group";

import { isValidObjectId } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import connectDB from "@/lib/dbConnect";

// Get group by ID
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

    await connectDB();

    const group = await Group.findById(id)
      .populate("createdBy", "firstName lastName profilePicture")
      .populate("members", "firstName lastName profilePicture")
      .populate("admins", "firstName lastName profilePicture")
      .populate("moderators", "firstName lastName profilePicture");

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    return NextResponse.json({ group });
  } catch (error) {
    console.error("Error fetching group:", error);
    return NextResponse.json(
      { error: "Failed to fetch group" },
      { status: 500 }
    );
  }
}

// Update group
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

    // Check if user is admin
    const isAdmin = group.admins.some(
      (adminId: { toString: () => string }) =>
        adminId.toString() === userData.id
    );

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Only group admins can update this group" },
        { status: 403 }
      );
    }

    const { name, description, isPrivate, coverImage } = await req.json();

    const updatedFields: any = {};
    if (name) updatedFields.name = name;
    if (description !== undefined) updatedFields.description = description;
    if (isPrivate !== undefined) updatedFields.isPrivate = isPrivate;
    if (coverImage !== undefined) updatedFields.coverImage = coverImage;

    const updatedGroup = await Group.findByIdAndUpdate(
      id,
      { $set: updatedFields },
      { new: true }
    ).populate("createdBy", "firstName lastName profilePicture");

    return NextResponse.json({
      message: "Group updated successfully",
      group: updatedGroup,
    });
  } catch (error) {
    console.error("Error updating group:", error);
    return NextResponse.json(
      { error: "Failed to update group" },
      { status: 500 }
    );
  }
}

// Delete group
export async function DELETE(
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

    // Check if user is the creator
    if (group.createdBy.toString() !== userData.id) {
      return NextResponse.json(
        { error: "Only the group creator can delete this group" },
        { status: 403 }
      );
    }

    await Group.findByIdAndDelete(id);

    return NextResponse.json({
      message: "Group deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting group:", error);
    return NextResponse.json(
      { error: "Failed to delete group" },
      { status: 500 }
    );
  }
}
