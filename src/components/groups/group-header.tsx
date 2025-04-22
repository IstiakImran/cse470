"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Lock, Unlock, UsersRound, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";
import Image from "next/image";

interface GroupHeaderProps {
  group: {
    _id: string;
    name: string;
    description?: string;
    isPrivate: boolean;
    coverImage?: string;
    createdAt: string;
    members: Array<
      | string
      | {
          _id: string;
          firstName?: string;
          lastName?: string;
          profilePicture?: string;
        }
    >;
    createdBy: {
      _id: string;
      firstName: string;
      lastName: string;
      profilePicture?: string;
    };
  };
  userId?: string;
}

export function GroupHeader({ group, userId }: GroupHeaderProps) {
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [joinStatus, setJoinStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMember, setIsMember] = useState(false);

  // Better handling for checking if user is a member
  useEffect(() => {
    if (!userId || !group.members) return;

    // Check if user is a member by comparing against member IDs in any format
    const memberCheck = group.members.some((member) => {
      const memberId = typeof member === "string" ? member : member._id;
      return memberId === userId;
    });

    setIsMember(memberCheck);
  }, [group.members, userId]);

  const isCreator =
    userId && group.createdBy ? group.createdBy._id === userId : false;
  const membersCount = Array.isArray(group.members) ? group.members.length : 0;

  const handleJoinGroup = async () => {
    if (!userId) {
      router.push("/login");
      return;
    }

    setIsJoining(true);
    setError(null);

    try {
      const response = await fetch(`/api/groups/${group._id}/join`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      if (group.isPrivate) {
        setJoinStatus("requested");
      } else {
        // Update local state to reflect membership without requiring refresh
        setIsMember(true);
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (isCreator) {
      setError("Group creators cannot leave their own group.");
      return;
    }

    setIsLeaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/groups/${group._id}/leave`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      // Update local state to reflect membership without requiring refresh
      setIsMember(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLeaving(false);
    }
  };

  // Clear any error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="space-y-4">
      <div className="relative h-48 md:h-64 w-full overflow-hidden rounded-lg mb-4">
        {group.coverImage ? (
          <Image
            width={100}
            height={100}
            src={group.coverImage}
            alt={group.name}
            className="w-full h-full object-cover"
            priority={true}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary/10 to-secondary/10 flex items-center justify-center">
            <UsersRound className="h-20 w-20 text-primary/20" />
          </div>
        )}
        <div className="absolute top-4 right-4">
          <Badge
            variant={group.isPrivate ? "secondary" : "outline"}
            className="text-sm px-3 py-1"
          >
            {group.isPrivate ? (
              <>
                <Lock className="h-3 w-3 mr-1" /> Private Group
              </>
            ) : (
              <>
                <Unlock className="h-3 w-3 mr-1" /> Public Group
              </>
            )}
          </Badge>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold">{group.name}</h1>
          <div className="flex items-center mt-2 text-sm text-muted-foreground gap-4">
            <div className="flex items-center">
              <UsersRound className="h-4 w-4 mr-1" />
              <span>
                {membersCount} {membersCount === 1 ? "member" : "members"}
              </span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Created on {formatDate(group.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          {userId &&
            (isMember ? (
              <Button
                variant="outline"
                onClick={handleLeaveGroup}
                disabled={isLeaving || isCreator}
              >
                {isLeaving ? "Leaving..." : "Leave Group"}
              </Button>
            ) : joinStatus === "requested" ? (
              <Button variant="secondary" disabled>
                Join Request Sent
              </Button>
            ) : (
              <Button onClick={handleJoinGroup} disabled={isJoining}>
                {isJoining
                  ? "Joining..."
                  : group.isPrivate
                  ? "Request to Join"
                  : "Join Group"}
              </Button>
            ))}
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md text-sm">
          {error}
        </div>
      )}

      {group.description && (
        <div className="prose dark:prose-invert max-w-none text-muted-foreground">
          <p>{group.description}</p>
        </div>
      )}

      <div className="py-4 border-t border-border">
        <h3 className="text-sm font-medium mb-2">Group Creator</h3>
        {group.createdBy ? (
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={group.createdBy.profilePicture} />
              <AvatarFallback>
                {group.createdBy.firstName.charAt(0)}
                {group.createdBy.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">
                {group.createdBy.firstName} {group.createdBy.lastName}
              </p>
              <p className="text-xs text-muted-foreground">Creator</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Creator information unavailable
          </p>
        )}
      </div>
    </div>
  );
}
