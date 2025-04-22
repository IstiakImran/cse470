// server.ts (in your project root)
import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  // Create Socket.IO server
  const io = new SocketIOServer(server, {
    path: "/api/socket/",
    addTrailingSlash: false,
  });

  // Make io available globally
  (global as any).io = io;

  // Set up Socket.IO event handlers
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

  server.listen(3000, () => {
    console.log("Ready on http://localhost:3000");
  });
});
