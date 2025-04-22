"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Heart as HeartOutline,
  FileHeart as HeartFilled,
  Reply,
  Trash,
  Edit,
  AlertCircle,
  Loader2,
} from "lucide-react";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { timeAgo } from "@/lib/utils";

/* ─────────────── Types ─────────────── */
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
}

interface Comment {
  _id: string;
  content: string;
  createdAt: string;
  userId: User;
  likes: string[]; // always strings on the client
  parentId?: string;
}

interface CommentSectionProps {
  postId: string;
  currentUserId?: string;
}

/* ──────────── Component ──────────── */
export function CommentSection({ postId, currentUserId }: CommentSectionProps) {
  const router = useRouter();

  /* State */
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [submittingReply, setSubmittingReply] = useState<
    Record<string, boolean>
  >({});
  const [activeReplies, setActiveReplies] = useState<Record<string, boolean>>(
    {}
  );
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  /* ───────── Fetch comments ───────── */
  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/posts/${postId}/comments`);
      if (!res.ok) throw new Error("Failed to fetch comments");
      const data = await res.json();

      // normalise everything: likes as strings, parentId as string | undefined
      setComments(
        data.comments.map((c: Comment) => ({
          ...c,
          parentId: c.parentId ?? undefined,
          likes: Array.isArray(c.likes) ? c.likes : [],
        }))
      );
    } catch (e: any) {
      console.error(e);
      setError("Unable to load comments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ───────── Post new comment ───────── */
  const handleSubmitComment = async () => {
    if (!currentUserId) return router.push("/login");
    if (!commentText.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentText }),
      });
      if (!res.ok) throw new Error("Failed to post comment");
      const data = await res.json();

      setComments((prev) => [
        {
          ...data.comment,
          parentId: data.comment.parentId ?? undefined,
          likes: Array.isArray(data.comment.likes) ? data.comment.likes : [],
        },
        ...prev,
      ]);
      setCommentText("");
    } catch (e: any) {
      console.error(e);
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  /* ───────── Post reply ───────── */
  /* ───────── Post reply ───────── */
  const handleSubmitReply = async (parentId: string) => {
    if (!currentUserId) return router.push("/login");
    const text = replyText[parentId];
    if (!text?.trim()) return;

    setSubmittingReply((p) => ({ ...p, [parentId]: true }));
    setError(null);

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: text,
          parentId: parentId, // Ensure parentId is explicitly set
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to post reply");
      }

      const data = await res.json();
      console.log("Reply posted:", data);

      // Option 1: Add the new reply directly to the comments state
      setComments((prev) => [
        ...prev,
        {
          ...data.comment,
          parentId: data.comment.parentId || undefined,
          likes: Array.isArray(data.comment.likes) ? data.comment.likes : [],
        },
      ]);

      // Option 2: Alternatively, refresh all comments
      // await fetchComments();

      // Clear reply text and hide reply box
      setReplyText((p) => {
        const t = { ...p };
        delete t[parentId];
        return t;
      });
      setActiveReplies((p) => ({ ...p, [parentId]: false }));
    } catch (e: any) {
      console.error("Error posting reply:", e);
      setError(e.message);
    } finally {
      setSubmittingReply((p) => ({ ...p, [parentId]: false }));
    }
  };

  /* ───────── Like / Unlike ───────── */
  const handleLikeComment = async (commentId: string) => {
    if (!currentUserId) return router.push("/login");
    try {
      const res = await fetch(`/api/comments/${commentId}/like`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to like/unlike");
      const { isLiked } = await res.json();

      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId
            ? {
                ...c,
                likes: isLiked
                  ? [...c.likes, currentUserId]
                  : c.likes.filter((id) => id !== currentUserId),
              }
            : c
        )
      );
    } catch (e: any) {
      console.error(e);
      setError(e.message);
    }
  };

  /* ───────── Delete ───────── */
  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      setComments((p) =>
        p.filter((c) => c._id !== commentId && c.parentId !== commentId)
      );
    } catch (e) {
      console.error(e);
    }
  };

  /* ───────── Edit ───────── */
  const handleEditComment = (c: Comment) => {
    setEditingComment(c._id);
    setEditText(c.content);
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editText.trim()) return;
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editText }),
      });
      if (!res.ok) throw new Error("Failed to update");

      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? { ...c, content: editText } : c))
      );
      setEditingComment(null);
      setEditText("");
    } catch (e) {
      console.error(e);
    }
  };

  /* ───────── Nesting helper: one‑level under root ───────── */
  const organizeComments = () => {
    const parents = comments
      .filter((c) => !c.parentId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    const repliesMap: Record<string, Comment[]> = {};

    const getRootId = (c: Comment): string => {
      let cur: Comment | undefined = c;
      while (cur?.parentId) cur = comments.find((x) => x._id === cur!.parentId);
      return cur ? cur._id : c._id;
    };

    comments
      .filter((c) => c.parentId)
      .forEach((rep) => {
        const root = getRootId(rep);
        (repliesMap[root] ||= []).push(rep);
      });

    Object.values(repliesMap).forEach((arr) =>
      arr.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    );

    return { parentComments: parents, repliesMap };
  };

  const { parentComments, repliesMap } = organizeComments();

  /* ───────── UI helpers ───────── */
  const toggleReply = (id: string) =>
    setActiveReplies((p) => ({ ...p, [id]: !p[id] }));

  const renderCommentCard = (comment: Comment) => {
    const liked = currentUserId ? comment.likes.includes(currentUserId) : false;
    const showBox = activeReplies[comment._id];

    return (
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={
              comment.userId.profilePicture ||
              "/default-avatar-icon-of-social-media-user-vector.jpg"
            }
          />
          <AvatarFallback>
            {comment.userId.firstName?.[0]}
            {comment.userId.lastName?.[0]}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="bg-muted/40 rounded-lg p-3">
            <div className="flex justify-between">
              <div>
                <span className="font-medium">
                  {comment.userId.firstName} {comment.userId.lastName}
                </span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {timeAgo(comment.createdAt)}
                </span>
              </div>

              {comment.userId._id === currentUserId && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleEditComment(comment)}
                    >
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteComment(comment._id)}
                      className="text-destructive"
                    >
                      <Trash className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {editingComment === comment._id ? (
              <>
                <Textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="resize-none min-h-[80px]"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingComment(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleSaveEdit(comment._id)}
                    disabled={!editText.trim()}
                  >
                    Save
                  </Button>
                </div>
              </>
            ) : (
              <p className="mt-1 whitespace-pre-line">{comment.content}</p>
            )}
          </div>

          <div className="flex items-center gap-4 mt-1 text-xs">
            <button
              className="flex items-center gap-1 hover:text-primary transition-colors"
              onClick={() => handleLikeComment(comment._id)}
            >
              {liked ? (
                <HeartFilled className="h-3 w-3 text-destructive" />
              ) : (
                <HeartOutline className="h-3 w-3" />
              )}
              <span>
                {comment.likes.length > 0 ? comment.likes.length : ""} Like
              </span>
            </button>

            <button
              className="flex items-center gap-1 hover:text-primary transition-colors"
              onClick={() => toggleReply(comment._id)}
            >
              <Reply className="h-3 w-3" />
              <span>Reply</span>
            </button>
          </div>

          {/* reply box */}
          {showBox && (
            <div className="flex gap-2 mt-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src="/default-avatar-icon-of-social-media-user-vector.jpg" />
                <AvatarFallback>User</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder="Write a reply…"
                  value={replyText[comment._id] || ""}
                  onChange={(e) =>
                    setReplyText((p) => ({
                      ...p,
                      [comment._id]: e.target.value,
                    }))
                  }
                  className="resize-none min-h-[60px] text-sm"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleReply(comment._id)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleSubmitReply(comment._id)}
                    disabled={
                      !replyText[comment._id]?.trim() ||
                      submittingReply[comment._id]
                    }
                  >
                    {submittingReply[comment._id] ? "Posting…" : "Reply"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  /* ───────── Render ───────── */
  if (loading) {
    return (
      <div className="p-4 border-t">
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">
            Loading comments…
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3 border-t">
      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-center text-sm">
          <AlertCircle className="h-4 w-4 mr-2" /> {error}
        </div>
      )}

      {/* new comment form */}
      <div className="flex gap-3">
        {currentUserId && (
          <Avatar>
            <AvatarImage src="/default-avatar-icon-of-social-media-user-vector.jpg" />
            <AvatarFallback>User</AvatarFallback>
          </Avatar>
        )}
        <div className="flex-1 space-y-2">
          <Textarea
            placeholder={
              currentUserId ? "Write a comment…" : "Log in to comment"
            }
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            disabled={!currentUserId || submitting}
            className="resize-none min-h-[80px]"
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={handleSubmitComment}
              disabled={!commentText.trim() || submitting}
            >
              {submitting ? "Posting…" : "Post Comment"}
            </Button>
          </div>
        </div>
      </div>

      <Separator className="my-4" />

      {/* comment list */}
      {parentComments.length === 0 ? (
        <p className="text-center text-muted-foreground py-4">
          No comments yet. Be the first!
        </p>
      ) : (
        <div className="space-y-4">
          {parentComments.map((pc) => (
            <div key={pc._id} className="group">
              {renderCommentCard(pc)}

              {repliesMap[pc._id]?.length > 0 && (
                <div className="space-y-3 mt-3 ml-12">
                  {repliesMap[pc._id].map((r) => (
                    <div key={r._id} className="group">
                      {renderCommentCard(r)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
