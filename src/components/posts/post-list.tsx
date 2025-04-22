"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PostCard } from "@/components/posts/post-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

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

interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface PostListProps {
  groupId: string;
  currentUserId?: string;
}

export function PostList({ groupId, currentUserId }: PostListProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, [groupId, currentPage]);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/groups/${groupId}/posts?page=${currentPage}&limit=5`
      );

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("You must be a member of this group to view posts");
        } else {
          throw new Error("Failed to fetch posts");
        }
      }

      const data = await response.json();

      // Ensure each post has a likes array
      const postsWithLikes = data.posts.map((post: Post) => ({
        ...post,
        likes: Array.isArray(post.likes) ? post.likes : [],
      }));

      setPosts(postsWithLikes);
      setPagination(data.pagination);
    } catch (err: any) {
      console.error("Error fetching posts:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!currentUserId) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to like post");
      }

      const data = await response.json();

      // Update post in state
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post._id === postId) {
            // Ensure post.likes is an array before modifying it
            const currentLikes = Array.isArray(post.likes) ? post.likes : [];

            // If post was liked, add user to likes array, otherwise remove
            const newLikes = data.isLiked
              ? [...currentLikes, currentUserId]
              : currentLikes.filter((id) => id !== currentUserId);

            return { ...post, likes: newLikes };
          }
          return post;
        })
      );
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete post");
      }

      // Remove post from state
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  const handleNextPage = () => {
    if (pagination && currentPage < pagination.pages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  if (loading && currentPage === 1) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-3 w-1/6" />
              </div>
            </div>
            <Skeleton className="h-24 w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="border rounded-lg p-8 text-center space-y-3">
        <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
        <h3 className="text-lg font-medium">Unable to load posts</h3>
        <p className="text-muted-foreground">{error}</p>
        {error.includes("member") && (
          <Button onClick={() => router.push(`/groups/${groupId}/join`)}>
            Join Group
          </Button>
        )}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center space-y-3">
        <h3 className="text-lg font-medium">No posts yet</h3>
        <p className="text-muted-foreground">
          Be the first to post in this group!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          currentUserId={currentUserId}
          onLike={() => handleLikePost(post._id)}
          onDelete={() => handleDeletePost(post._id)}
        />
      ))}

      {pagination && pagination.pages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <Button
            variant="outline"
            onClick={handlePrevPage}
            disabled={currentPage === 1 || loading}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {pagination.pages}
          </span>
          <Button
            variant="outline"
            onClick={handleNextPage}
            disabled={currentPage === pagination.pages || loading}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
