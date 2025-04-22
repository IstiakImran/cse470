import { NextRequest, NextResponse } from "next/server";

import Group from "@/models/Group";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/option";
import connectDB from "@/lib/dbConnect";

// Get all groups
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userData = session?.user;
    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    let query = {};
    if (search) {
      query = {
        name: { $regex: search, $options: "i" },
      };
    }

    const groups = await Group.find(query)
      .populate("createdBy", "firstName lastName profilePicture")
      .sort({ createdAt: -1 });

    return NextResponse.json({ groups });
  } catch (error) {
    console.error("Error fetching groups:", error);
    return NextResponse.json(
      { error: "Failed to fetch groups" },
      { status: 500 }
    );
  }
}

// Create new group
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userData = session?.user;

    if (!userData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { name, description, isPrivate, coverImage } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Group name is required" },
        { status: 400 }
      );
    }

    // Check if group with same name exists
    const existingGroup = await Group.findOne({ name });
    if (existingGroup) {
      return NextResponse.json(
        { error: "A group with this name already exists" },
        { status: 409 }
      );
    }

    const newGroup = await Group.create({
      name,
      description,
      isPrivate: !!isPrivate,
      coverImage,
      createdBy: userData.id,
      members: [userData.id],
      admins: [userData.id],
    });

    // Populate creator info for response
    const group = await Group.findById(newGroup._id).populate(
      "createdBy",
      "firstName lastName profilePicture"
    );

    return NextResponse.json(
      { message: "Group created successfully", group },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating group:", error);
    return NextResponse.json(
      { error: "Failed to create group" },
      { status: 500 }
    );
  }
}
