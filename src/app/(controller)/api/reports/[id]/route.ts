import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/dbConnect";
import Report from "@/models/Report";
import { authOptions } from "../../auth/[...nextauth]/option";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and admin status
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    // if (!session.user.isAdmin) {
    //   return NextResponse.json(
    //     { message: "Only admins can view reports" },
    //     { status: 403 }
    //   );
    // }

    // Connect to database
    await connectDB();

    // Find report by ID with populated reporter data
    const report = await Report.findById(params.id)
      .populate("reporterId", "firstName lastName email")
      .lean();

    if (!report) {
      return NextResponse.json(
        { message: "Report not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error fetching report:", error);
    return NextResponse.json(
      { message: "Error fetching report" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and admin status
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (!session.user.isAdmin) {
      return NextResponse.json(
        { message: "Only admins can update reports" },
        { status: 403 }
      );
    }

    // Connect to database
    await connectDB();

    // Parse request body
    const body = await request.json();
    const { resolved } = body;

    // Find and update report
    const report = await Report.findByIdAndUpdate(
      params.id,
      { resolved },
      { new: true }
    ).populate("reporterId", "firstName lastName email");

    if (!report) {
      return NextResponse.json(
        { message: "Report not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Report updated successfully",
      report,
    });
  } catch (error) {
    console.error("Error updating report:", error);
    return NextResponse.json(
      { message: "Error updating report" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and admin status
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (!session.user.isAdmin) {
      return NextResponse.json(
        { message: "Only admins can delete reports" },
        { status: 403 }
      );
    }

    // Connect to database
    await connectDB();

    // Find and delete report
    const report = await Report.findByIdAndDelete(params.id);

    if (!report) {
      return NextResponse.json(
        { message: "Report not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Report deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting report:", error);
    return NextResponse.json(
      { message: "Error deleting report" },
      { status: 500 }
    );
  }
}
