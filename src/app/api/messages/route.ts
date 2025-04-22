// app/api/messages/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";
import { getServerSession } from "next-auth/next";
import mongoose from "mongoose";
import { authOptions } from "../auth/[...nextauth]/option";

interface MessageRequest {
  receiverId: string;
  content: string;
  conversationId?: string;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { receiverId, content, conversationId }: MessageRequest =
      await req.json();

    if (!receiverId || !content) {
      return NextResponse.json(
        { error: "Receiver ID and content are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const senderId = new mongoose.Types.ObjectId(session.user.id);
    const receiver = new mongoose.Types.ObjectId(receiverId);

    // Find or create conversation
    let conversation;
    if (conversationId) {
      try {
        conversation = await Conversation.findById(
          new mongoose.Types.ObjectId(conversationId)
        );
        if (!conversation) {
          return NextResponse.json(
            { error: "Conversation not found" },
            { status: 404 }
          );
        }
      } catch (err) {
        return NextResponse.json(
          { error: "Invalid conversation ID format" },
          { status: 400 }
        );
      }
    } else {
      // Look for existing conversation
      conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiver] },
      });

      // Create new conversation if none exists
      if (!conversation) {
        conversation = await Conversation.create({
          participants: [senderId, receiver],
          unreadCount: { [receiverId]: 0, [session.user.id]: 0 },
        });
      }
    }

    // Create message
    const message = await Message.create({
      senderId,
      receiverId: receiver,
      content,
      conversationId: conversation._id,
      read: false,
    });

    // Update conversation with last message and increment unread count
    const unreadCount = { ...conversation.unreadCount };
    unreadCount[receiverId] = (unreadCount[receiverId] || 0) + 1;

    await Conversation.findByIdAndUpdate(conversation._id, {
      lastMessage: message._id,
      unreadCount,
      updatedAt: new Date(),
    });

    // If Socket.IO server is initialized, emit the message
    const io = (global as any).io;
    if (io) {
      io.to(receiverId).emit("receive-message", {
        _id: message._id,
        senderId,
        receiverId: receiver,
        content,
        conversationId: conversation._id,
        createdAt: message.createdAt,
        read: false,
      });
    }

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
