// app/api/ride-requests/[requestId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import RideRequest from "@/models/RideRequest";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import mongoose from "mongoose";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await dbConnect();
    const { requestId } = params;

    if (!requestId) {
      return NextResponse.json(
        { success: false, message: "Missing request ID" },
        { status: 400 }
      );
    }

    // Find the ride request to get the conversation ID
    const rideRequest = await RideRequest.findById(requestId).session(session);

    if (!rideRequest) {
      await session.abortTransaction();
      return NextResponse.json(
        { success: false, message: "Ride request not found" },
        { status: 404 }
      );
    }

    // If there's an associated conversation, delete related messages first
    if (rideRequest.conversation) {
      // Delete all messages in the conversation
      await Message.deleteMany({
        conversationId: rideRequest.conversation,
      }).session(session);

      // Delete the conversation itself
      await Conversation.findByIdAndDelete(rideRequest.conversation).session(
        session
      );
    }

    // Delete the ride request
    await RideRequest.findByIdAndDelete(requestId).session(session);

    await session.commitTransaction();

    return NextResponse.json(
      { success: true, message: "Ride and conversation deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    await session.abortTransaction();
    console.error("Error deleting ride:", error);
    return NextResponse.json(
      { success: false, message: "Error deleting ride" },
      { status: 500 }
    );
  } finally {
    session.endSession();
  }
}
