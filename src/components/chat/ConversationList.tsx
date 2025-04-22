// components/chat/ConversationList.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { useSocket } from "@/contexts/SocketContext";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  status?: string;
}

interface Message {
  _id: string;
  content: string;
  senderId: string;
  createdAt: string;
}

interface Conversation {
  _id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: {
    [key: string]: number;
  };
  updatedAt: string;
}

export default function ConversationList({ userId }: { userId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { socket, isConnected } = useSocket();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();

    // Listen for new messages to update the conversation list
    if (socket) {
      socket.on("receive-message", (message) => {
        fetchConversations();
      });

      socket.on("messages-read", ({ conversationId }) => {
        setConversations((prev) =>
          prev.map((conv) =>
            conv._id === conversationId
              ? {
                  ...conv,
                  unreadCount: {
                    ...conv.unreadCount,
                    [userId]: 0,
                  },
                }
              : conv
          )
        );
      });
    }

    return () => {
      if (socket) {
        socket.off("receive-message");
        socket.off("messages-read");
      }
    };
  }, [socket, userId]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/conversations");
      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return (
      conversation.participants.find(
        (participant) => participant._id !== userId
      ) || conversation.participants[0]
    );
  };

  return (
    <div className="divide-y divide-gray-200">
      {loading ? (
        <div className="flex justify-center items-center h-20">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      ) : conversations.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          No conversations yet. Search for users to start chatting!
        </div>
      ) : (
        conversations.map((conversation) => {
          const otherUser = getOtherParticipant(conversation);
          const isActive = pathname?.includes(conversation._id);
          const unreadCount = conversation.unreadCount?.[userId] || 0;

          return (
            <div
              key={conversation._id}
              onClick={() => router.push(`/chat/${conversation._id}`)}
              className={`p-4 flex items-center cursor-pointer hover:bg-gray-50 ${
                isActive ? "bg-blue-50" : ""
              }`}
            >
              <div className="relative">
                {otherUser.profilePicture ? (
                  <Image
                    src={otherUser.profilePicture}
                    alt={`${otherUser.firstName} ${otherUser.lastName}`}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                    {otherUser.firstName?.[0]}
                    {otherUser.lastName?.[0]}
                  </div>
                )}
                {otherUser.status === "online" && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                )}
              </div>
              <div className="ml-3 flex-1 overflow-hidden">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-gray-900 truncate">
                    {otherUser.firstName} {otherUser.lastName}
                  </h3>
                  {conversation.updatedAt && (
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(conversation.updatedAt), {
                        addSuffix: true,
                      })}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500 truncate">
                    {conversation.lastMessage?.content || "No messages yet"}
                  </p>
                  {unreadCount > 0 && (
                    <span className="ml-2 bg-blue-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
