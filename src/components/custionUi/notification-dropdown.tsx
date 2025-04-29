"use client";

import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  _id: string;
  senderId: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  } | null;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationDropdownProps {
  onClose: () => void;
  onNotificationsRead: () => void;
}

export default function NotificationDropdown({
  onClose,
  onNotificationsRead,
}: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    fetchNotifications();

    // Mark notifications as read when dropdown is opened
    markAsRead();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/notifications?page=${page}&limit=${limit}`);
      if (!res.ok) throw new Error("Failed to fetch notifications");

      const data = await res.json();

      if (page === 1) {
        setNotifications(data.notifications);
      } else {
        setNotifications((prev) => [...prev, ...data.notifications]);
      }

      setHasMore(data.notifications.length === limit);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      const res = await fetch("/api/notifications/mark-read", {
        method: "POST",
      });

      if (res.ok) {
        onNotificationsRead();
        // Update local state to show all notifications as read
        setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const loadMore = () => {
    setPage(page + 1);
    fetchNotifications();
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const getNotificationIcon = (type: string) => {
    // You can customize this based on your notification types
    switch (type) {
      case "friend_request":
        return "user-plus";
      case "message":
        return "message-circle";
      default:
        return "bell";
    }
  };

  if (notifications.length === 0 && !loading) {
    return (
      <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-950 rounded-md shadow-lg border border-gray-200 dark:border-gray-800 z-50">
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          No notifications
        </div>
      </div>
    );
  }

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-950 rounded-md shadow-lg border border-gray-200 dark:border-gray-800 z-50">
      <div className="p-3 border-b border-gray-200 dark:border-gray-800">
        <h3 className="font-medium">Notifications</h3>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {notifications.map((notification) => (
          <div
            key={notification._id}
            className={`p-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 ${
              !notification.isRead ? "bg-blue-50 dark:bg-blue-900/20" : ""
            }`}
          >
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                {notification.senderId?.profilePicture ? (
                  <AvatarImage
                    src={notification.senderId.profilePicture}
                    alt={`${notification.senderId.firstName} ${notification.senderId.lastName}`}
                  />
                ) : null}
                <AvatarFallback>
                  {notification.senderId
                    ? getInitials(
                        notification.senderId.firstName,
                        notification.senderId.lastName
                      )
                    : "SYS"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="text-sm mb-1">{notification.message}</p>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(new Date(notification.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="p-4 text-center">
            <div className="animate-pulse">Loading...</div>
          </div>
        )}

        {hasMore && !loading && (
          <div className="p-2 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={loadMore}
              className="w-full text-sm"
            >
              Load More
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
