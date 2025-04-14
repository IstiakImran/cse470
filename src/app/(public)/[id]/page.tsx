"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import PostCard from "@/components/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { UserCheck, UserPlus } from "lucide-react";

interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  profilePicture: string | null;
  followersCount: number;
  followingCount: number;
  posts: any[];
  isFollowing: boolean;
}

export default function UserProfilePage() {
  const params = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [params.id]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/user/public?id=${params.id}`);
      const data = await response.json();
      if (response.ok) {
        setProfile(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!profile) return;

    setFollowLoading(true);
    try {
      const response = await fetch("/api/follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetUserId: profile.id, // Changed from userId to targetUserId to match API expectation
        }),
      });

      if (response.ok) {
        setProfile((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            isFollowing: !prev.isFollowing,
            followersCount: prev.isFollowing
              ? prev.followersCount - 1
              : prev.followersCount + 1,
          };
        });
      } else {
        // Add error handling for non-OK responses
        const errorData = await response.json();
        console.error("Follow error:", errorData);
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handlePostLiked = (postId: string, liked: boolean) => {
    if (profile) {
      setProfile({
        ...profile,
        posts: profile.posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                likesCount: liked ? post.likesCount + 1 : post.likesCount - 1,
                hasLiked: liked,
              }
            : post
        ),
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-4">
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-1 gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="mb-8">
        <CardHeader className="relative">
          <div className="absolute top-4 right-4">
            <Button
              variant={profile.isFollowing ? "secondary" : "default"}
              onClick={handleFollow}
              disabled={followLoading}
            >
              {profile.isFollowing ? (
                <>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Following
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Follow
                </>
              )}
            </Button>
          </div>
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.profilePicture || ""} />
              <AvatarFallback>
                {profile.firstName[0]}
                {profile.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h1 className="text-2xl font-bold">
                {profile.firstName} {profile.lastName}
              </h1>
              <p className="text-muted-foreground">{profile.email}</p>
            </div>
            <p className="text-center max-w-md">{profile.bio}</p>
            <div className="flex space-x-8">
              <div className="text-center">
                <p className="font-bold">{profile.followersCount}</p>
                <p className="text-muted-foreground">Followers</p>
              </div>
              <div className="text-center">
                <p className="font-bold">{profile.followingCount}</p>
                <p className="text-muted-foreground">Following</p>
              </div>
              <div className="text-center">
                <p className="font-bold">{profile.posts.length}</p>
                <p className="text-muted-foreground">Posts</p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {profile.posts.map((post) => (
          <PostCard
            key={post.id}
            post={{
              ...post,
              user: {
                id: profile.id,
                firstName: profile.firstName,
                lastName: profile.lastName,
                profilePicture: profile.profilePicture,
              },
            }}
            onPostLiked={handlePostLiked}
            onPostDeleted={() => {}}
          />
        ))}
      </div>
    </div>
  );
}