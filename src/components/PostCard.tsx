"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import {
  Heart,
  MessageCircle,
  MoreVertical,
  Share2,
  Pencil,
  Trash2,
  Globe,
  Users,
  Lock,
  Flag,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import ReportModal from "./ReportModal";
import Image from "next/image";

interface PostCardProps {
  post: any;
  onPostDeleted: (postId: string) => void;
  onPostLiked: (postId: string, liked: boolean) => void;
  currentUserId?: string;
}

export default function PostCard({
  post,
  onPostDeleted,
  onPostLiked,
  currentUserId,
}: PostCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const handleLike = async () => {
    try {
      const response = await fetch("/api/normal-posts/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id }),
      });

      const data = await response.json();
      if (response.ok) {
        onPostLiked(post.id, data.liked);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleEdit = async () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    try {
      const response = await fetch(`/api/normal-posts/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editedContent }),
      });

      if (response.ok) {
        setIsEditing(false);
        // Refresh the post content
        post.content = editedContent;
      }
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/normal-posts/${post.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onPostDeleted(post.id);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
    setIsDeleteDialogOpen(false);
  };

  const handleShare = async () => {
    try {
      const response = await fetch(`/api/normal-posts/${post.id}/share`, {
        method: "POST",
      });

      if (response.ok) {
        // Handle successful share
      }
    } catch (error) {
      console.error("Error sharing post:", error);
    }
  };

  const loadComments = async () => {
    try {
      const response = await fetch(`/api/normal-posts/${post.id}/comments`);
      const data = await response.json();
      if (response.ok) {
        setComments(data.comments);
      }
    } catch (error) {
      console.error("Error loading comments:", error);
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`/api/normal-posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });

      const data = await response.json();
      if (response.ok) {
        setComments([...comments, data.comment]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  const getVisibilityIcon = () => {
    switch (post.postType) {
      case "public":
        return <Globe className="h-4 w-4" />;
      case "friends":
        return <Users className="h-4 w-4" />;
      case "only_me":
        return <Lock className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const handleReportSubmit = async (reason: string) => {
    setIsReportModalOpen(false);
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: "Post",
          targetId: post.id || post._id,
          postId: post.id || post._id, // Set postId for Post reports
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

  // Check if current user is the post author
  const isAuthor =
    currentUserId === (post.userId?._id || post.userId || post.user?.id);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center space-x-4 p-4">
        <Avatar>
          <AvatarImage
            src={post.user?.profilePicture || post.userId?.profilePicture || ""}
          />
          <AvatarFallback>
            {(post.user?.firstName || post.userId?.firstName)?.[0]}
            {(post.user?.lastName || post.userId?.lastName)?.[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">
                {post.user?.firstName || post.userId?.firstName}{" "}
                {post.user?.lastName || post.userId?.lastName}
              </p>
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
                <span>•</span>
                {getVisibilityIcon()}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isAuthor && (
                  <>
                    <DropdownMenuItem onClick={handleEdit}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setIsDeleteDialogOpen(true)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem onClick={() => setIsReportModalOpen(true)}>
                  <Flag className="mr-2 h-4 w-4" />
                  Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleEdit}>
                Save
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="whitespace-pre-wrap">{post.content}</p>
            {post.imageUrl && (
              <Image
                width={500}
                height={500}
                src={post.imageUrl}
                alt="Post"
                className="mt-4 rounded-lg max-h-96 w-full object-cover"
              />
            )}
          </>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="flex items-center space-x-4 w-full">
          <Button
            variant="ghost"
            size="sm"
            className={post.hasLiked ? "text-red-500" : ""}
            onClick={handleLike}
          >
            <Heart className="mr-2 h-4 w-4" />
            {post.likesCount ||
              (Array.isArray(post.likes) ? post.likes.length : 0)}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowComments(!showComments);
              if (!showComments) loadComments();
            }}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            {comments.length || post.commentCount || 0}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </CardFooter>

      {showComments && (
        <div className="border-t p-4">
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id || comment._id} className="flex space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {comment.userName || comment.user?.firstName?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {comment.userName ||
                      `${comment.user?.firstName} ${comment.user?.lastName}`}
                  </p>
                  <p className="text-sm">{comment.content}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.createdAt))} ago
                  </p>
                  <button
                    onClick={() => setIsReportModalOpen(true)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Report
                  </button>
                </div>
              </div>
            ))}
            <div className="flex space-x-2">
              <Textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[60px]"
              />
              <Button onClick={handleComment}>Post</Button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete this post? This action cannot be
            undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleReportSubmit}
      />
    </Card>
  );
}
