// app/api/conversations/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import mongoose from "mongoose";
import connectDB from "@/lib/dbConnect";
import { authOptions } from "../../auth/[...nextauth]/option";

// Get conversation details and/or messages
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to the database
    await connectDB();

    // Get the current user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversationId = params.id;
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return NextResponse.json(
        { error: "Invalid conversation ID" },
        { status: 400 }
      );
    }

    // Get URL parameters for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Fetch conversation and check if user is a participant
    const conversation = await Conversation.findById(conversationId)
      .populate("participants", "firstName lastName profilePicture status")
      .lean();

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Check if current user is a participant in this conversation
    const isParticipant = conversation.participants.some(
      (p: any) => p._id.toString() === session.user.id
    );

    if (!isParticipant) {
      return NextResponse.json(
        { error: "You don't have access to this conversation" },
        { status: 403 }
      );
    }

    // Count total messages for pagination
    const totalMessages = await Message.countDocuments({
      conversationId,
    });

    // Fetch messages with pagination, sorted by createdAt (newest last)
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .populate("senderId", "firstName lastName profilePicture status")
      .lean();

    // Mark messages as read
    await Message.updateMany(
      {
        conversationId,
        receiverId: session.user.id,
        read: false,
      },
      { $set: { read: true } }
    );

    // Reset unread count for this user
    if (conversation.unreadCount && conversation.unreadCount[session.user.id]) {
      await Conversation.findByIdAndUpdate(conversationId, {
        [`unreadCount.${session.user.id}`]: 0,
      });
    }

    // Notify other participants through socket that messages were read
    // This is handled separately via the socket connection in the client

    return NextResponse.json({
      conversation,
      messages,
      pagination: {
        page,
        limit,
        totalMessages,
      },
    });
  } catch (error) {
    console.error("Error in conversation route:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversation data" },
      { status: 500 }
    );
  }
}

// Update conversation (could be used for muting, archiving, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversationId = params.id;
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return NextResponse.json(
        { error: "Invalid conversation ID" },
        { status: 400 }
      );
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Check if current user is a participant
    if (
      !conversation.participants.includes(
        new mongoose.Types.ObjectId(session.user.id)
      )
    ) {
      return NextResponse.json(
        { error: "You don't have access to this conversation" },
        { status: 403 }
      );
    }

    const data = await request.json();

    // Add validation for update data here...
    // For example: allow only certain fields to be updated

    const updatedConversation = await Conversation.findByIdAndUpdate(
      conversationId,
      { $set: data },
      { new: true }
    ).populate("participants", "firstName lastName profilePicture status");

    return NextResponse.json({ conversation: updatedConversation });
  } catch (error) {
    console.error("Error updating conversation:", error);
    return NextResponse.json(
      { error: "Failed to update conversation" },
      { status: 500 }
    );
  }
}

// Delete conversation (soft delete or archive)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversationId = params.id;
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return NextResponse.json(
        { error: "Invalid conversation ID" },
        { status: 400 }
      );
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Check if current user is a participant
    if (
      !conversation.participants.includes(
        new mongoose.Types.ObjectId(session.user.id)
      )
    ) {
      return NextResponse.json(
        { error: "You don't have access to this conversation" },
        { status: 403 }
      );
    }

    // Instead of actually deleting, you could implement soft delete
    // For example: Set a 'deletedBy' array with user IDs
    // await Conversation.findByIdAndUpdate(conversationId, {
    //   $addToSet: { deletedBy: session.user.id }
    // });

    // For now, we'll actually delete it
    await Conversation.findByIdAndDelete(conversationId);
    await Message.deleteMany({ conversationId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return NextResponse.json(
      { error: "Failed to delete conversation" },
      { status: 500 }
    );
  }
}
