"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  MoreHorizontal,
  Heart,
  MessageSquare,
  Share,
  Trash,
  FileHeart as HeartFilled,
  Flag,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { timeAgo } from "@/lib/utils";
import { CommentSection } from "@/components/posts/comment-section";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Image from "next/image";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ReportModal from "../ReportModal";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
}

interface Post {
  _id: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  likes: string[];
  commentCount: number;
  userId: User;
}

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  onLike: () => void;
  onDelete: () => void;
}

export function PostCard({
  post,
  currentUserId,
  onLike,
  onDelete,
}: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [error, setError] = useState("");

  // Fix: Ensure post.likes is an array before calling includes
  const isLiked =
    currentUserId && Array.isArray(post.likes)
      ? post.likes.includes(currentUserId)
      : false;
  const isAuthor = currentUserId === post.userId._id;

  const handleReportSubmit = async (reason: string) => {
    setIsReportModalOpen(false);
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: "Post",
          targetId: post._id,
          postId: post._id, // Set postId for Post reports
          reason,
        }),
      });

      if (response.ok) {
        // Show success message or notification
        alert("Report submitted successfully");
      } else {
        const data = await response.json();
        setError(data.message || "Failed to submit report");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      setError("An error occurred while submitting the report");
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={post.userId.profilePicture} />
              <AvatarFallback>{post.userId.firstName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">
                {post.userId.firstName} {post.userId.lastName}
              </p>
              <p className="text-xs text-muted-foreground">
                {timeAgo(post.createdAt)}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isAuthor && (
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-destructive"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => setIsReportModalOpen(true)}>
                <Flag className="h-4 w-4 mr-2" />
                Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="prose dark:prose-invert max-w-none">
          <p className="whitespace-pre-line">{post.content}</p>
        </div>

        {post.imageUrl && (
          <div className="mt-4 rounded-md overflow-hidden max-h-96">
            <Image
              width={100}
              height={100}
              src={post.imageUrl}
              alt="Post image"
              className="w-full h-auto object-contain"
            />
          </div>
        )}

        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <HeartFilled className="h-3 w-3 text-destructive" />
            {/* Fix: Handle case where post.likes might be undefined */}
            <span>{Array.isArray(post.likes) ? post.likes.length : 0}</span>
          </div>
          {post.commentCount > 0 && (
            <button
              onClick={() => setShowComments(true)}
              className="hover:underline focus:outline-none"
            >
              {post.commentCount}{" "}
              {post.commentCount === 1 ? "comment" : "comments"}
            </button>
          )}
        </div>
      </CardContent>

      <Separator />

      <CardFooter className="p-0">
        <div className="grid grid-cols-3 w-full divide-x">
          <Button
            variant="ghost"
            className="rounded-none h-12"
            onClick={onLike}
          >
            {isLiked ? (
              <HeartFilled className="h-5 w-5 mr-2 text-destructive" />
            ) : (
              <Heart className="h-5 w-5 mr-2" />
            )}
            <span>{isLiked ? "Liked" : "Like"}</span>
          </Button>
          <Button
            variant="ghost"
            className="rounded-none h-12"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageSquare className="h-5 w-5 mr-2" />
            <span>Comment</span>
          </Button>
          <Button variant="ghost" className="rounded-none h-12">
            <Share className="h-5 w-5 mr-2" />
            <span>Share</span>
          </Button>
        </div>
      </CardFooter>

      {showComments && (
        <CommentSection postId={post._id} currentUserId={currentUserId} />
      )}

      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleReportSubmit}
      />
    </Card>
  );
}
