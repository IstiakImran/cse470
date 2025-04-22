// app/api/conversations/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import { getServerSession } from "next-auth/next";
import mongoose from "mongoose";
import { authOptions } from "../../auth/[...nextauth]/option";

interface RouteParams {
  params: {
    id: string;
  };
}

interface PaginationResponse {
  page: number;
  limit: number;
  totalMessages: number;
}

interface ConversationResponse {
  messages: any[];
  pagination: PaginationResponse;
}

// Get messages for a specific conversation
export async function GET(req: NextRequest, context: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = context.params;
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const page = parseInt(url.searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    await dbConnect();

    try {
      const conversationId = new mongoose.Types.ObjectId(id);
      const userId = new mongoose.Types.ObjectId(session.user.id);

      // Verify the user is part of this conversation
      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: { $in: [userId] },
      });

      if (!conversation) {
        return NextResponse.json(
          { error: "Conversation not found" },
          { status: 404 }
        );
      }

      // Get messages for this conversation
      const messages = await Message.find({ conversationId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: "senderId",
          model: "User",
          select: "firstName lastName profilePicture",
        });

      // Mark messages as read
      await Message.updateMany(
        {
          conversationId,
          receiverId: userId,
          read: false,
        },
        { $set: { read: true } }
      );

      // Reset unread count for this user using proper dot notation for MongoDB
      const updatePath = `unreadCount.${session.user.id}`;
      const updateObject: Record<string, any> = {};
      updateObject[updatePath] = 0;

      await Conversation.updateOne(
        { _id: conversationId },
        { $set: updateObject }
      );

      // Notify other users via socket that messages were read
      const io = (global as any).io;
      if (io) {
        // Find other participants to notify them
        const otherParticipants = conversation.participants
          .filter((p: any) => !p.equals(userId))
          .map((p: any) => p.toString());

        otherParticipants.forEach((participantId: string) => {
          io.to(participantId).emit("messages-read", {
            conversationId: id,
            readerId: session.user.id,
          });
        });
      }

      const totalMessages = await Message.countDocuments({ conversationId });

      const response: ConversationResponse = {
        messages,
        pagination: {
          page,
          limit,
          totalMessages,
        },
      };

      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      if (error instanceof mongoose.Error.CastError) {
        return NextResponse.json(
          { error: "Invalid conversation ID format" },
          { status: 400 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
