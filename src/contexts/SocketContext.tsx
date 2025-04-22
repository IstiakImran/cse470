// contexts/SocketContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId: string;
}) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    // Connect to the standalone Socket.IO server
    const SOCKET_SERVER_URL =
      process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:4000";

    const socketInstance = io(SOCKET_SERVER_URL, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ["websocket", "polling"],
    });

    socketInstance.on("connect", () => {
      console.log("Socket connected with ID:", socketInstance.id);
      setIsConnected(true);
      setSocket(socketInstance);

      // Join room with userId
      socketInstance.emit("join", userId);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setIsConnected(false);
    });

    // Clean up on unmount
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
    };
  }, [userId]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
