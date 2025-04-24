// app/(dashboard)/chat/[conversationId]/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Send, MoreHorizontal, Phone, Video } from "lucide-react";
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
  senderId: User | string;
  receiverId: string;
  read: boolean;
  createdAt: string;
  conversationId: string;
}

interface PaginationData {
  page: number;
  limit: number;
  totalMessages: number;
}

interface MessagesResponse {
  messages: Message[];
  pagination: PaginationData;
}

export default function ChatPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { data: session } = useSession();
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isSending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const processedMessageIds = useRef(new Set());

  useEffect(() => {
    if (conversationId) {
      setMessages([]);
      processedMessageIds.current.clear();
      setPage(1);
      setHasMore(true);
      setLoading(true);
      fetchMessages(1);

      // Mark messages as read when conversation is opened
      if (socket && session?.user?.id) {
        socket.emit("mark-read", {
          senderId: session.user.id,
          conversationId,
        });
      }

      // Fetch conversation participants if we don't have them
      fetchConversationParticipants();
    }
  }, [conversationId, session?.user?.id]);

  const fetchConversationParticipants = async () => {
    if (!conversationId || !session?.user?.id) return;

    try {
      const response = await fetch(`/api/conversations/${conversationId}`);
      if (!response.ok) {
        console.error("Failed to fetch conversation details");
        return;
      }

      const data = await response.json();

      // Find the other participant (not the current user)
      if (data.conversation && data.conversation.participants) {
        const otherParticipant = data.conversation.participants.find(
          (participant: User) => participant._id !== session.user.id
        );

        if (otherParticipant) {
          setOtherUser(otherParticipant);
        }
      }
    } catch (error) {
      console.error("Error fetching conversation participants:", error);
    }
  };

  useEffect(() => {
    if (socket && session?.user?.id) {
      // Clean up previous listeners
      socket.off("receive-message");
      socket.off("user-typing");

      // Listen for new messages
      socket.on("receive-message", (message: Message) => {
        if (message.conversationId === conversationId) {
          // Check if we've already processed this message ID
          if (!processedMessageIds.current.has(message._id)) {
            processedMessageIds.current.add(message._id);

            setMessages((prev) => {
              // Make sure we're not adding duplicates
              const exists = prev.some((msg) => msg._id === message._id);
              if (exists) return prev;
              return [...prev, message];
            });

            // Mark message as read immediately if from other user
            const isSenderOtherUser =
              typeof message.senderId === "object"
                ? message.senderId._id !== session.user.id
                : message.senderId !== session.user.id;

            if (isSenderOtherUser) {
              socket.emit("mark-read", {
                senderId: session.user.id,
                conversationId,
              });
            }
          }
        }
      });

      // Listen for typing indicators
      socket.on(
        "user-typing",
        ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
          if (userId === otherUser?._id) {
            setTypingUser(isTyping ? userId : null);
          }
        }
      );
    }

    return () => {
      if (socket) {
        socket.off("receive-message");
        socket.off("user-typing");
      }
    };
  }, [socket, session?.user?.id, conversationId, otherUser?._id]);

  useEffect(() => {
    if (messages.length > 0 && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const fetchMessages = async (pageToFetch: number = page) => {
    if (!conversationId) return;

    try {
      if (pageToFetch === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await fetch(
        `/api/conversations/${conversationId}?page=${pageToFetch}&limit=20`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.statusText}`);
      }

      const data: MessagesResponse = await response.json();

      // Track message IDs we've seen to avoid duplicates
      data.messages.forEach((msg) => {
        processedMessageIds.current.add(msg._id);
      });

      // Find the other user from the first message or via a separate API call
      if (data.messages.length > 0 && !otherUser) {
        const msg = data.messages[0];
        const senderId =
          typeof msg.senderId === "object" ? msg.senderId._id : msg.senderId;

        if (senderId !== session?.user?.id) {
          // The other user is the sender
          if (typeof msg.senderId === "object") {
            setOtherUser(msg.senderId);
          } else {
            // We only have the ID, fetch the complete user data
            const userResponse = await fetch(`/api/users/${senderId}`);
            if (userResponse.ok) {
              const userData = await userResponse.json();
              setOtherUser(userData.user);
            }
          }
        } else {
          // The other user is the receiver
          const receiverId = msg.receiverId;
          const userResponse = await fetch(`/api/users/${receiverId}`);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setOtherUser(userData.user);
          }
        }
      }

      if (pageToFetch === 1) {
        setMessages(data.messages);
      } else {
        setMessages((prev) => [...data.messages, ...prev]);
      }

      setHasMore(
        data.pagination.page * data.pagination.limit <
          data.pagination.totalMessages
      );

      setPage(pageToFetch);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !inputMessage.trim() ||
      !session?.user?.id ||
      !conversationId ||
      isSending
    ) {
      return;
    }

    // Required check - we might not have otherUser yet if the conversation is new
    if (!otherUser) {
      console.error("Cannot send message - recipient not found");
      return;
    }

    const messageData = {
      receiverId: otherUser._id,
      content: inputMessage,
      conversationId: conversationId,
    };

    try {
      setSending(true);
      const optimisticId = `temp-${Date.now()}`;
      const originalMessage = inputMessage;
      setInputMessage("");

      // Optimistically add message to UI
      const optimisticMessage: Message = {
        _id: optimisticId,
        content: originalMessage,
        senderId: session.user.id, // Will be a string
        receiverId: otherUser._id,
        read: false,
        createdAt: new Date().toISOString(),
        conversationId,
      };

      setMessages((prev) => [...prev, optimisticMessage]);

      // Send message via API
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server error:", errorData);
        throw new Error(errorData.error || "Failed to send message");
      }

      const responseData = await response.json();

      // Add the real message ID to our processed set to avoid duplicates
      processedMessageIds.current.add(responseData.message._id);

      // Replace the optimistic message with the real one
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === optimisticId
            ? { ...msg, _id: responseData.message._id }
            : msg
        )
      );

      // If using sockets, also send via socket for real-time
      if (socket && isConnected) {
        socket.emit("send-message", {
          ...messageData,
          senderId: session.user.id,
          messageId: responseData.message._id,
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove the optimistic message on error
      setMessages((prev) =>
        prev.filter((msg) => msg._id !== `temp-${Date.now()}`)
      );
      // Show error to user
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);

    // Send typing indicator
    if (socket && isConnected && otherUser && session?.user?.id) {
      socket.emit("typing", {
        senderId: session.user.id,
        receiverId: otherUser._id,
        isTyping: e.target.value.length > 0,
      });
    }
  };

  const loadMoreMessages = () => {
    if (hasMore && !loading && !loadingMore) {
      const nextPage = page + 1;
      fetchMessages(nextPage);
    }
  };

  // Handle scroll to load more messages
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollTop === 0 && hasMore && !loading && !loadingMore) {
        loadMoreMessages();
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [hasMore, loading, loadingMore, page]);

  if (!conversationId) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800">
            Select a conversation
          </h2>
          <p className="mt-2 text-gray-500">
            Choose a conversation from the sidebar or start a new one
          </p>
        </div>
      </div>
    );
  }

  // Calculate if button should be enabled
  const isSendButtonEnabled = inputMessage.trim().length > 0 && !isSending;

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      {otherUser && (
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
          <div className="flex items-center">
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
            <div className="ml-3">
              <h2 className="font-medium text-gray-900">
                {otherUser.firstName} {otherUser.lastName}
              </h2>
              <p className="text-sm text-gray-500">
                {otherUser.status === "online" ? "Online" : "Offline"}
                {typingUser === otherUser._id && (
                  <span className="ml-2 italic">typing...</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button className="p-2 rounded-full hover:bg-gray-100">
              <Phone className="h-5 w-5 text-gray-500" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <Video className="h-5 w-5 text-gray-500" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <MoreHorizontal className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>
      )}

      {/* Chat messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4">
        {loading && page === 1 ? (
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {loadingMore && (
              <div className="flex justify-center my-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            )}
            {hasMore && !loadingMore && (
              <div className="flex justify-center my-4">
                <button
                  onClick={loadMoreMessages}
                  className="px-4 py-2 text-sm bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Load more messages
                </button>
              </div>
            )}
            {messages.map((message) => {
              const isSender =
                typeof message.senderId === "object"
                  ? message.senderId._id === session?.user?.id
                  : message.senderId === session?.user?.id;

              const sender: User | null =
                typeof message.senderId === "object"
                  ? message.senderId // populated message
                  : message.senderId === otherUser?._id
                  ? otherUser // fallback for live message
                  : null;

              return (
                <div
                  key={message._id}
                  className={`mb-4 flex ${
                    isSender ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isSender && sender && (
                    <div className="flex-shrink-0 mr-2">
                      {sender.profilePicture ? (
                        <Image
                          src={sender.profilePicture}
                          alt={`${sender.firstName} ${sender.lastName}`}
                          width={32}
                          height={32}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs">
                          {sender.firstName?.[0]}
                          {sender.lastName?.[0]}
                        </div>
                      )}
                    </div>
                  )}
                  <div>
                    <div
                      className={`px-4 py-2 rounded-lg max-w-xs sm:max-w-md break-words ${
                        isSender
                          ? "bg-blue-500 text-white rounded-br-none"
                          : "bg-gray-100 text-gray-800 rounded-bl-none"
                      }`}
                    >
                      {message.content}
                    </div>
                    <div
                      className={`text-xs text-gray-500 mt-1 ${
                        isSender ? "text-right" : "text-left"
                      }`}
                    >
                      {message.createdAt &&
                        formatDistanceToNow(new Date(message.createdAt), {
                          addSuffix: true,
                        })}
                      {isSender && message.read && (
                        <span className="ml-2">Read</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSendMessage} className="flex items-center">
          <input
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!isSendButtonEnabled}
            className={`p-2 rounded-r-lg ${
              isSendButtonEnabled
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-blue-300 cursor-not-allowed"
            } transition-colors`}
          >
            <Send className="h-5 w-5 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
}
