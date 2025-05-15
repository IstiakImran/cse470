"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { GroupHeader } from "@/components/groups/group-header";
import { CreatePostForm } from "@/components/posts/create-post-form";
import { PostList } from "@/components/posts/post-list";
import { isValidObjectId } from "@/lib/utils";

// Define all necessary interfaces for type safety
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
}

interface Group {
  _id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  coverImage?: string;
  createdAt: string;
  members: string[]; // Store as string[] for consistent comparison
  createdBy: User;
}

export default function GroupPage() {
  const router = useRouter();
  const params = useParams();
  const [group, setGroup] = useState<Group | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMember, setIsMember] = useState<boolean>(false);

  useEffect(() => {
    const groupId = params?.id as string;

    // Validate ObjectId before making API request
    if (!groupId || !isValidObjectId(groupId)) {
      console.error("Invalid group ID:", groupId);
      router.push("/groups");
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch group data
        const groupUrl = `/api/groups/${groupId}`;
        console.log("Fetching group data from:", groupUrl);

        const groupResponse = await fetch(groupUrl);
        console.log("Group API response status:", groupResponse.status);

        if (!groupResponse.ok) {
          if (groupResponse.status === 404) {
            console.error("Group not found");
            router.push("/groups");
            return;
          }
          throw new Error(`Failed to fetch group: ${groupResponse.statusText}`);
        }

        const responseData = await groupResponse.json();
        const groupData = responseData.group; // Extract the group from response
        console.log("Group data received:", groupData);

        // Ensure members are properly formatted as strings
        const normalizedGroup = {
          ...groupData,
          members: Array.isArray(groupData.members)
            ? groupData.members.map((member: { _id: any; id: any }) =>
                typeof member === "string" ? member : member._id || member.id
              )
            : [],
        };

        setGroup(normalizedGroup);

        // Fetch current user data
        const userUrl = "/api/user/me";
        console.log("Fetching user profile from:", userUrl);

        const userResponse = await fetch(userUrl);
        console.log("User API response status:", userResponse.status);

        if (userResponse.ok) {
          const userData = await userResponse.json();
          console.log("User data received:", userData);

          // Transform user data to match expected structure
          const transformedUserData = {
            _id: userData._id || userData.id, // Handle both id formats
            firstName: userData.firstName,
            lastName: userData.lastName,
            profilePicture: userData.profilePicture,
          };

          setCurrentUser(transformedUserData);

          // Check if user is a member of the group
          const userId = transformedUserData._id;
          console.log("Checking membership for user:", userId);
          console.log("Group members:", normalizedGroup.members);

          // More robust membership check
          const memberCheck = normalizedGroup.members.some(
            (memberId: { _id: any; id: any; toString: () => any }) => {
              const memberIdStr =
                typeof memberId === "object"
                  ? (memberId._id || memberId.id).toString()
                  : memberId.toString();
              return memberIdStr === userId.toString();
            }
          );

          console.log("Is user a member of group:", memberCheck);
          setIsMember(memberCheck);
        } else {
          console.warn(
            "Failed to fetch user profile:",
            userResponse.statusText
          );
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        console.error("Error in data fetching:", errorMessage, err);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params?.id, router]);

  if (isLoading) {
    return <div className="max-w-4xl mx-auto p-4">Loading group...</div>;
  }

  if (error || !group) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-red-500">
        Error: {error || "Group not found"}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <GroupHeader group={group} userId={currentUser?._id} />

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Posts</h2>

        {currentUser && isMember && (
          <CreatePostForm groupId={group._id} user={currentUser} />
        )}

        <PostList groupId={group._id} currentUserId={currentUser?._id} />
      </div>
    </div>
  );
}
