// lib/socket.ts
import { Server as NetServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { NextApiRequest } from "next";
import { NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function SocketHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (res.socket?.server.io) {
    console.log("Socket is already running");
    res.end();
    return;
  }

  const httpServer: NetServer = res.socket?.server as any;
  const io = new SocketIOServer(httpServer, {
    path: "/api/socket",
    addTrailingSlash: false,
  });

  res.socket.server.io = io;

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join a room with the user's ID
    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their room`);
    });

    // Handle sending messages
    socket.on("send-message", async (data) => {
      const { senderId, receiverId, content, conversationId } = data;

      // Emit to receiver's room
      io.to(receiverId).emit("receive-message", {
        senderId,
        receiverId,
        content,
        conversationId,
        createdAt: new Date(),
      });

      // Confirm message was sent to sender
      socket.emit("message-sent", { success: true, messageId: data.messageId });
    });

    // Handle typing indicators
    socket.on("typing", ({ senderId, receiverId, isTyping }) => {
      io.to(receiverId).emit("user-typing", { userId: senderId, isTyping });
    });

    // Handle read receipts
    socket.on("mark-read", ({ senderId, conversationId }) => {
      io.to(senderId).emit("messages-read", { conversationId });
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  console.log("Socket server started");
  res.end();
}
