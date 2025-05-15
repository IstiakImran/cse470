import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import Report from "@/models/Report";
import mongoose from "mongoose";
import { authOptions } from "../auth/[...nextauth]/option";
import connectDB from "@/lib/dbConnect";

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    // Parse request body
    const body = await req.json();
    const { targetType, targetId, reason, postId, commentId, groupPostId } =
      body;

    // Validate input
    if (!targetType || !targetId || !reason) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["User", "Post", "Comment"].includes(targetType)) {
      return NextResponse.json(
        { message: "Invalid target type" },
        { status: 400 }
      );
    }

    // Create report object with appropriate fields based on type
    const reportData: any = {
      reporterId: new mongoose.Types.ObjectId(session.user.id),
      targetType,
      targetId: new mongoose.Types.ObjectId(targetId),
      reason,
      resolved: false,
    };

    // Add specific IDs based on target type
    if (postId) {
      reportData.postId = new mongoose.Types.ObjectId(postId);
    }
    if (commentId) {
      reportData.commentId = new mongoose.Types.ObjectId(commentId);
    }
    if (groupPostId) {
      reportData.groupPostId = new mongoose.Types.ObjectId(groupPostId);
    }

    // Create report
    const report = await Report.create(reportData);

    // Populate the report with reporter information
    await report.populate("reporterId", "firstName lastName email");

    return NextResponse.json(
      { message: "Report submitted successfully", report },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json(
      { message: "Error creating report" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    // Check authentication and admin status
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Uncomment to restrict to admins only
    // if (!session.user.isAdmin) {
    //   return NextResponse.json(
    //     { message: "Only admins can view reports" },
    //     { status: 403 }
    //   );
    // }

    // Connect to database
    await connectDB();

    // Get URL parameters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const targetType = searchParams.get("targetType");

    // Build query
    const query: any = {};
    if (status === "resolved") {
      query.resolved = true;
    } else if (status === "unresolved") {
      query.resolved = false;
    }

    if (targetType && ["User", "Post", "Comment"].includes(targetType)) {
      query.targetType = targetType;
    }

    // Fetch reports with pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const reports = await Report.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("reporterId", "firstName lastName email")
      .populate({
        path: "targetId",
        select: "firstName lastName email content", // Adjust fields based on what you need
        populate: [
          { path: "userId", select: "firstName lastName email" }, // For posts and comments
          { path: "groupId", select: "name" }, // For group posts
        ],
      })
      .lean();

    const total = await Report.countDocuments(query);

    return NextResponse.json({
      reports,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { message: "Error fetching reports" },
      { status: 500 }
    );
  }
}
