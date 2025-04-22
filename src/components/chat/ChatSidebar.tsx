// components/chat/ChatSidebar.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, MessageCircle, User, LogOut } from "lucide-react";
import ConversationList from "./ConversationList";
import UserSearchResults from "./UserSearchResults";
import { signOut } from "next-auth/react";

interface ChatSidebarProps {
  userId: string;
}

export default function ChatSidebar({ userId }: ChatSidebarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("conversations");

  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(
          `/api/users/search?q=${encodeURIComponent(searchQuery)}`
        );
        const data = await response.json();
        setSearchResults(data.users || []);
      } catch (error) {
        console.error("Error searching users:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimeout = setTimeout(() => {
      if (searchQuery) {
        searchUsers();
      }
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  const handleStartNewChat = async (recipientId: string) => {
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ participantId: recipientId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();

      // Check if data and conversation exist before accessing _id
      if (data && data.conversation && data.conversation._id) {
        router.push(`/chat/${data.conversation._id}`);
        setSearchQuery("");
      } else {
        console.error("Invalid response structure:", data);
        throw new Error("Invalid response structure from API");
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
    }
  };

  return (
    <div className="w-80 h-full border-r border-gray-200 bg-white flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold flex-1">Messages</h1>
          <button
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Log out"
          >
            <LogOut className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <div className="mt-4 relative">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("conversations")}
          className={`flex-1 py-3 text-center ${
            activeTab === "conversations"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500"
          }`}
        >
          <MessageCircle className="h-5 w-5 mx-auto" />
          <span className="text-xs mt-1 block">Chats</span>
        </button>
        <button
          onClick={() => setActiveTab("contacts")}
          className={`flex-1 py-3 text-center ${
            activeTab === "contacts"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500"
          }`}
        >
          <User className="h-5 w-5 mx-auto" />
          <span className="text-xs mt-1 block">Users</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {searchQuery && searchResults.length > 0 ? (
          <UserSearchResults
            users={searchResults}
            onSelectUser={handleStartNewChat}
          />
        ) : activeTab === "conversations" ? (
          <ConversationList userId={userId} />
        ) : (
          <div className="p-4 text-center text-gray-500">
            Search for users to start a conversation
          </div>
        )}
      </div>
    </div>
  );
}
