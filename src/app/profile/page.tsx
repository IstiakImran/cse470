"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostCard from "@/components/PostCard";
import { Skeleton } from "@/components/ui/skeleton";

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
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/user/profile");
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

  const handlePostDeleted = (postId: string) => {
    if (profile) {
      setProfile({
        ...profile,
        posts: profile.posts.filter((post) => post.id !== postId),
      });
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
      <div className="container mx-auto px-4 py-8 max-w-2xl space-y-4">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader className="relative">
          <div className="absolute top-4 right-4">
            <Button variant="outline">Edit Profile</Button>
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
            <div className="flex space-x-4">
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
        <CardContent>
          <Tabs defaultValue="posts">
            <TabsList className="w-full">
              <TabsTrigger value="posts" className="flex-1">
                Posts
              </TabsTrigger>
              <TabsTrigger value="media" className="flex-1">
                Media
              </TabsTrigger>
              <TabsTrigger value="likes" className="flex-1">
                Likes
              </TabsTrigger>
            </TabsList>
            <TabsContent value="posts" className="space-y-4 mt-4">
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
                  onPostDeleted={handlePostDeleted}
                  onPostLiked={handlePostLiked}
                />
              ))}
            </TabsContent>
            <TabsContent value="media">Media content</TabsContent>
            <TabsContent value="likes">Liked posts</TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
