"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import PostCard from "@/components/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  UserCheck,
  UserPlus,
  ShieldAlert,
  ShieldCheck,
  MoreHorizontal,
  GraduationCap,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

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
  isBlocked: boolean;
  isAlumni: boolean;
  alumniVerificationStatus: "unverified" | "pending" | "verified" | "rejected";
}

export default function UserProfilePage() {
  const params = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);

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
          targetUserId: profile.id,
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
        const errorData = await response.json();
        console.error("Follow error:", errorData);
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleBlock = async () => {
    if (!profile) return;

    setBlockLoading(true);
    try {
      const response = await fetch("/api/block", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetUserId: profile.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            isBlocked: data.isBlocked,
          };
        });
      } else {
        const errorData = await response.json();
        console.error("Block error:", errorData);
      }
    } catch (error) {
      console.error("Error toggling block:", error);
    } finally {
      setBlockLoading(false);
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

  const renderAlumniBadge = () => {
    if (!profile?.isAlumni) return null;

    let icon;
    let badgeVariant: "default" | "secondary" | "outline" | "destructive" =
      "secondary";
    let tooltipText = "";

    switch (profile.alumniVerificationStatus) {
      case "verified":
        icon = <CheckCircle className="h-4 w-4 mr-1" />;
        badgeVariant = "default";
        tooltipText = "Verified Alumni";
        break;
      case "pending":
        icon = <Clock className="h-4 w-4 mr-1" />;
        badgeVariant = "outline";
        tooltipText = "Alumni Verification Pending";
        break;
      case "rejected":
        icon = <XCircle className="h-4 w-4 mr-1" />;
        badgeVariant = "destructive";
        tooltipText = "Alumni Verification Rejected";
        break;
      default:
        return null;
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant={badgeVariant} className="ml-2 flex items-center">
              <GraduationCap className="h-4 w-4 mr-1" />
              {icon}
              Alumni
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
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
          <div className="absolute top-4 right-4 flex space-x-2">
            <Button
              variant={profile.isFollowing ? "secondary" : "default"}
              onClick={handleFollow}
              disabled={followLoading || profile.isBlocked}
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleBlock} disabled={blockLoading}>
                  {profile.isBlocked ? (
                    <>
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      Unblock User
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="h-4 w-4 mr-2" />
                      Block User
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
              <div className="flex items-center justify-center">
                <h1 className="text-2xl font-bold">
                  {profile.firstName} {profile.lastName}
                </h1>
                {renderAlumniBadge()}
              </div>
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

            {profile.isBlocked && (
              <div className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-2 rounded-md flex items-center mt-2">
                <ShieldAlert className="h-4 w-4 mr-2" />
                You have blocked this user
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {profile.isBlocked ? (
        <div className="text-center p-8 border rounded-lg bg-muted">
          <ShieldAlert className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg mb-2">Content hidden</p>
          <p className="text-muted-foreground">
            You&apos;ve blocked this user. Unblock to see their posts.
          </p>
        </div>
      ) : (
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
      )}
    </div>
  );
}
