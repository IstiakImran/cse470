"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { User, LogOut, Settings, Sun, Moon, Bell } from "lucide-react";
import { ModeToggle } from "./theme-toggle";
import NotificationDropdown from "./notification-dropdown";

interface UserResult {
  id: number;
  firstName: string;
  lastName: string;
  // Add more fields if needed
}

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Fetch unread notification count
  useEffect(() => {
    if (session) {
      fetchUnreadCount();
    }
  }, [session]);

  async function fetchUnreadCount() {
    try {
      const res = await fetch("/api/notifications/count");
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error("Error fetching notification count:", error);
    }
  }

  // Close dropdowns on clicks outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target as Node)
      ) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Debounced search effect
  useEffect(() => {
    // Clear any existing timer
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // If there's no searchTerm, reset results & return
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    // Set up a new debounced timer
    typingTimeoutRef.current = setTimeout(() => {
      fetchSearchResults(searchTerm);
    }, 300); // 300ms or whatever delay you prefer

    // Cleanup on unmount or when searchTerm changes
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  async function fetchSearchResults(term: string) {
    try {
      const res = await fetch(
        `/api/user/search?query=${encodeURIComponent(term)}`
      );
      if (!res.ok) {
        throw new Error("Search request failed");
      }
      const data = await res.json();
      setSearchResults(data.users ?? []);
      setShowDropdown(true);
    } catch (error) {
      console.error(error);
      // Optionally set error UI
    }
  }

  function handleSearchItemClick(userId: number) {
    // Navigate to the public profile page
    router.push(`/${userId}`);
    setSearchTerm("");
    setShowDropdown(false);
  }

  function toggleNotifications() {
    setShowNotifications(!showNotifications);
  }

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!session?.user?.name) return "U";

    const nameParts = session.user.name.split(" ");
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return nameParts[0][0].toUpperCase();
  };

  return (
    <nav className="p-4 md:p-6 shadow-md fixed top-0 left-0 right-0 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 z-50">
      <div className="container mx-auto flex flex-row justify-between items-center">
        {/* Logo / Brand */}
        <div className="flex items-center gap-4">
          <Link href={"/"}>
            <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em]">
              Connected
            </h2>
          </Link>
        </div>

        {/* Search Box */}
        {session && (
          <div className="relative" ref={dropdownRef}>
            <input
              type="text"
              placeholder="Search for people..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border rounded-xl px-4 py-2 w-48 sm:w-64 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            {/* Dropdown results */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute left-0 mt-2 w-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-md shadow-md max-h-64 overflow-auto z-10">
                {searchResults.map((user) => {
                  const fullName = `${user.firstName} ${user.lastName}`;
                  return (
                    <div
                      key={user.id}
                      onClick={() => handleSearchItemClick(user.id)}
                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-sm"
                    >
                      {fullName}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Right-side Buttons */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <ModeToggle />

          {/* Notifications - Only show when logged in */}
          {session && (
            <div className="relative" ref={notificationRef}>
              <Button
                variant="ghost"
                className="relative rounded-full h-8 w-8 p-0 flex items-center justify-center"
                onClick={toggleNotifications}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>

              {showNotifications && (
                <NotificationDropdown
                  onClose={() => setShowNotifications(false)}
                  onNotificationsRead={() => setUnreadCount(0)}
                />
              )}
            </div>
          )}

          {/* Auth Buttons */}
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative rounded-full h-8 w-8 p-0"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={session.user?.image || ""}
                      alt={session.user?.name || "User"}
                    />
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-white dark:bg-gray-950"
                sideOffset={5}
                // Prevent scrollbar issue when dropdown opens
                onCloseAutoFocus={(e) => e.preventDefault()}
              >
                <div className="flex items-center justify-start gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={session.user?.image || ""}
                      alt={session.user?.name || "User"}
                    />
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {session.user?.name || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user?.email || ""}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex w-full items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>My Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/chat" className="flex w-full items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Chat</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/groups" className="flex w-full items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Groups</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/rides" className="flex w-full items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Rides</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/profile/edit"
                    className="flex w-full items-center"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Edit Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="flex items-center text-red-500 focus:text-red-500"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-2">
              <Link href={"/sign-in"}>
                <Button variant={"ghost"} className="w-auto">
                  Sign In
                </Button>
              </Link>
              <Link href={"/sign-up"}>
                <Button className="w-auto rounded-lg">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
