// app/api/users/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/option";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const query = url.searchParams.get("q") || "";

    if (!query || query.length < 2) {
      return NextResponse.json({ users: [] }, { status: 200 });
    }

    await dbConnect();

    // Search for users by name or email, excluding the current user
    const users = await User.find({
      _id: { $ne: session.user.id },
      $or: [
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    })
      .select("_id firstName lastName email profilePicture status")
      .limit(10);

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    );
  }
}
