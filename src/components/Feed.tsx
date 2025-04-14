"use client";

import { useEffect, useState } from "react";
// import CreatePost from "./CreatePost";
// import PostCard from "./PostCard";
import { Skeleton } from "./ui/skeleton";
import CreatePost from "./CreatePost";
import PostCard from "./PostCard";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture: string | null;
}

interface Post {
  id: string;
  content: string;
  imageUrl?: string;
  postType: "public" | "friends" | "only_me";
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  hasLiked: boolean;
  user: User;
}

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/feed");
      const data = await response.json();
      if (response.ok) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostCreated = () => {
    fetchPosts();
  };

  const handlePostDeleted = (postId: string) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
  };

  const handlePostLiked = (postId: string, liked: boolean) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likesCount: liked ? post.likesCount + 1 : post.likesCount - 1,
              hasLiked: liked,
            }
          : post
      )
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CreatePost onPostCreated={handlePostCreated} />
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onPostDeleted={handlePostDeleted}
          onPostLiked={handlePostLiked}
        />
      ))}
    </div>
  );
}
