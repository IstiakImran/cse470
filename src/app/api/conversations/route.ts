// app/api/conversations/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import { getServerSession } from "next-auth/next";

import mongoose from "mongoose";
import { authOptions } from "../auth/[...nextauth]/option";

// Get all conversations for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const userId = new mongoose.Types.ObjectId(session.user.id);

    // Find all conversations where the current user is a participant
    const conversations = await Conversation.find({
      participants: { $in: [userId] },
    })
      .populate({
        path: "participants",
        model: "User",
        select: "firstName lastName profilePicture status",
      })
      .populate({
        path: "lastMessage",
        model: "Message",
      })
      .sort({ updatedAt: -1 });

    return NextResponse.json({ conversations }, { status: 200 });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

// Create a new conversation
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { participantId } = await req.json();

    if (!participantId) {
      return NextResponse.json(
        { error: "Participant ID is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const otherUserId = new mongoose.Types.ObjectId(participantId);

    // Check if a conversation already exists between these users
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, otherUserId] },
    });

    if (conversation) {
      return NextResponse.json(
        {
          conversation,
          message: "Conversation already exists",
        },
        { status: 200 }
      );
    }

    // Create new conversation
    conversation = await Conversation.create({
      participants: [userId, otherUserId],
      unreadCount: { [participantId]: 0, [session.user.id]: 0 },
    });

    return NextResponse.json({ conversation }, { status: 201 });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}
