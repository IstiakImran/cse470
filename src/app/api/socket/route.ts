// app/api/socket/route.ts
import { NextRequest } from "next/server";
import { Server as ServerIO } from "socket.io";

// Define a global interface to access io
declare global {
  let io: ServerIO | undefined;
}

export const runtime = "nodejs"; // Important: use Node.js runtime, not Edge

export async function GET(req: NextRequest) {
  try {
    // Return early if socket is already initialized
    if (global.io) {
      return new Response("Socket is already running", { status: 200 });
    }

    // Create a new Socket.IO server
    const io = new ServerIO({
      path: "/api/socket/",
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
      // This is the key part - we need to use the WebSocket transport
      transports: ["websocket", "polling"],
    });

    // Event handlers
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
        socket.emit("message-sent", {
          success: true,
          messageId: data.messageId,
        });
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

    // Store the io instance globally
    global.io = io;

    return new Response("Socket server started", { status: 200 });
  } catch (error) {
    console.error("Socket initialization error:", error);
    return new Response("Error initializing socket server", { status: 500 });
  }
}
