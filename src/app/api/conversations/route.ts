// src/app/api/conversations/route.ts
import { NextResponse } from "next/server";

import { getServerSession } from "next-auth";

import mongoose from "mongoose";

// Import all required models
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import User from "@/models/User";
import connectDB from "@/lib/dbConnect";
import { authOptions } from "../auth/[...nextauth]/option";

export async function GET(req: Request) {
  try {
    // Connect to the database
    await connectDB();

    // Get the current user from the session
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Find all conversations where the current user is a participant
    const conversations = await Conversation.find({
      participants: { $in: [userId] },
    })
      .populate({
        path: "participants",
        model: User,
        select: "_id firstName lastName profilePicture email", // Select the fields you need
      })
      .populate({
        path: "lastMessage",
        model: Message,
      })
      .sort({ updatedAt: -1 });

    // Format the response data
    const formattedConversations = conversations.map((conv) => {
      const otherParticipants = conv.participants.filter(
        (p: any) => p._id.toString() !== userId
      );

      return {
        _id: conv._id,
        participants: conv.participants,
        otherParticipants,
        lastMessage: conv.lastMessage,
        unreadCount: conv.unreadCount[userId] || 0,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
      };
    });

    return NextResponse.json(
      { conversations: formattedConversations },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Error fetching conversations: " + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    // Connect to the database
    await connectDB();

    // Get the current user from the session
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const { participantId } = await req.json();
    const currentUserId = session.user.id;

    if (!mongoose.Types.ObjectId.isValid(participantId)) {
      return NextResponse.json(
        { error: "Invalid participant ID" },
        { status: 400 }
      );
    }

    // Use the static method to find or create a conversation
    const conversation = await Conversation.findOrCreateConversation([
      currentUserId,
      participantId,
    ]);

    // Populate the conversation with participant details
    await conversation.populate({
      path: "participants",
      model: User,
      select: "username profilePicture email",
    });

    return NextResponse.json({ conversation }, { status: 200 });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Error creating conversation: " + (error as Error).message },
      { status: 500 }
    );
  }
}
