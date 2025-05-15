import { NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import User from "@/models/User";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/option";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "";

  if (!query.trim()) {
    return NextResponse.json({ users: [] });
  }

  try {
    await connectDB();

    // Get current user session to check for blocked users
    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id;

    // Create a regex search pattern for case-insensitive search
    const searchPattern = new RegExp(query, "i");

    // Define the base search conditions
    const nameConditions = [
      { firstName: searchPattern },
      { lastName: searchPattern },
    ];

    // Initialize an empty filter object that we'll build based on conditions
    // Using any type to avoid TypeScript issues with MongoDB query operators
    const filter: any = { $or: nameConditions };

    // If user is logged in, handle blocked users
    if (currentUserId) {
      // Get the current user with their blocklist
      const currentUser = await User.findById(currentUserId);

      if (currentUser) {
        // Get users who have blocked the current user
        const usersWhoBlockedMe = await User.find({
          blockedUsers: new mongoose.Types.ObjectId(currentUserId),
        }).select("_id");

        const blockedByIds = usersWhoBlockedMe.map((user) => user._id);

        // Combine all IDs to exclude (my blocks + those who blocked me + myself)
        const allExcludedIds = [
          ...(currentUser.blockedUsers || []),
          ...blockedByIds,
          new mongoose.Types.ObjectId(currentUserId),
        ];

        // Add the exclusion filter if we have IDs to exclude
        if (allExcludedIds.length > 0) {
          filter._id = { $nin: allExcludedIds };
        }
      }
    }

    // Execute the query with our correctly built filter
    const users = await User.find(filter)
      .select("firstName lastName profilePicture")
      .limit(10)
      .lean();

    // Format the results
    const formattedUsers = users.map((user) => ({
      id: (user as any)._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      profilePicture: user.profilePicture || null,
    }));

    return NextResponse.json({ users: formattedUsers });
  } catch (error) {
    console.error("Search users error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
